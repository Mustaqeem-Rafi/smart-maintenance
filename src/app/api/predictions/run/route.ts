import { NextResponse } from "next/server";
import connectDB from "@/src/lib/db";
import Incident from "@/src/models/Incident";
import Prediction from "@/src/models/Prediction";

export const dynamic = "force-dynamic";

// ============================================================================
// 🧠 THE MASTER MATH LIBRARY (Hybrid of v1 & v2)
// ============================================================================

const DAY_MS = 86400000;

// --- 1. Robust Basic Stats (Resistant to outliers) ---
function median(xs: number[]) {
  const arr = [...xs].sort((a, b) => a - b);
  const m = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
}

function mean(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

// Median Absolute Deviation (The "Robust Standard Deviation")
function mad(xs: number[]) {
  const med = median(xs);
  const absDevs = xs.map((x) => Math.abs(x - med));
  return median(absDevs);
}

// --- 2. Spearman Rank Correlation (Robust Trend Detection) ---
// Detects monotonic trends (e.g., intervals getting consistently shorter)
function spearmanRho(xs: number[]) {
  const n = xs.length;
  if (n < 3) return 0;
  const sorted = xs.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const rank = Array(n).fill(0);
  for (let r = 0; r < n; r++) rank[sorted[r].i] = r + 1;
  const tRank = Array.from({ length: n }, (_, i) => i + 1);
  const rMean = mean(rank);
  const tMean = mean(tRank);
  let num = 0, dr = 0, dt = 0;
  for (let i = 0; i < n; i++) {
    const a = rank[i] - rMean;
    const b = tRank[i] - tMean;
    num += a * b;
    dr += a * a;
    dt += b * b;
  }
  return num / Math.sqrt(dr * dt);
}

// --- 3. Weibull Survival Analysis (Engineering Standard) ---
// Fits a failure curve to determine if equipment is in "Wear Out" phase
function fitWeibull(intervalsDays: number[]) {
  const x = [...intervalsDays].sort((a, b) => a - b);
  const n = x.length;
  if (n < 3) return null;
  const zs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < n; i++) {
    const p = (i + 1 - 0.3) / (n + 0.4);
    const y = Math.log(-Math.log(1 - p));
    const z = Math.log(x[i]);
    ys.push(y);
    zs.push(z);
  }
  const zMean = mean(zs);
  const yMean = mean(ys);
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (zs[i] - zMean) * (ys[i] - yMean);
    den += (zs[i] - zMean) ** 2;
  }
  const k = num / den; // Shape parameter (>1 means wear out)
  const b = yMean - k * zMean;
  const lambda = Math.exp(-b / k); // Scale parameter
  if (!isFinite(k) || !isFinite(lambda) || k <= 0 || lambda <= 0) return null;
  return { k, lambda };
}

function weibullHazard(tDays: number, k: number, lambda: number) {
  const x = tDays / lambda;
  return (k / lambda) * Math.pow(x, k - 1);
}

// --- 4. Holt-Winters Double Exponential Smoothing (Trend Forecasting) ---
// Best for predicting the *exact next date* when there is a trend
function doubleExponentialSmoothing(intervals: number[], alpha = 0.5, beta = 0.4): number {
  if (intervals.length < 2) return intervals[0] || 0;
  let level = intervals[0];
  let trend = intervals[1] - intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    const prevLevel = level;
    level = alpha * intervals[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }
  return Math.max(1, level + trend); // Forecast next interval
}

// --- 5. Bootstrapping (Confidence Intervals) ---
// Simulates 1000 realities to see how "sure" we are
function bootstrapIntervals(intervalsDays: number[], B = 1000) {
  const n = intervalsDays.length;
  const samples: number[] = [];
  for (let b = 0; b < B; b++) {
    let s = 0;
    for (let i = 0; i < n; i++) s += intervalsDays[Math.floor(Math.random() * n)];
    samples.push(s / n);
  }
  samples.sort((a, b) => a - b);
  return { 
    lo: samples[Math.floor(B * 0.1)], // 10th percentile
    hi: samples[Math.floor(B * 0.9)]  // 90th percentile
  };
}

// --- 6. Poisson Tail Probability (Cluster Detection) ---
function poissonTailProb(lambda: number, kObs: number) {
  function logFactorial(k: number) {
    let s = 0;
    for (let i = 2; i <= k; i++) s += Math.log(i);
    return s;
  }
  let cdf = 0;
  for (let k = 0; k < kObs; k++) {
    const logP = k * Math.log(lambda) - lambda - logFactorial(k);
    cdf += Math.exp(logP);
  }
  return Math.max(0, 1 - cdf);
}

// --- 7. Chi-Square (Seasonality) ---
function chiSquareDayOfWeek(dates: Date[]) {
  const counts = Array(7).fill(0);
  dates.forEach((d) => counts[d.getDay()]++);
  const n = dates.length;
  const expected = n / 7;
  let chi2 = 0;
  for (let i = 0; i < 7; i++) chi2 += ((counts[i] - expected) ** 2) / expected;
  const significant = chi2 > 10.0; // Threshold for significance
  const maxCount = Math.max(...counts);
  return significant ? { dayIndex: counts.indexOf(maxCount), strength: maxCount / n } : null;
}

// --- 8. Dynamic Confidence Scoring ---
function calculateConfidence(n: number, consistency: number, mathScore: number) {
  // More data (n) = higher confidence
  // Lower variability (consistency) = higher confidence
  // Stronger math signal (rho/chi2) = higher confidence
  let score = 50;
  score += Math.min(20, n * 2); // Data volume bonus
  score += Math.min(20, (1 - consistency) * 30); // Consistency bonus
  score += mathScore; // Algorithm specific strength
  return Math.min(99, Math.max(30, Math.floor(score)));
}

// ============================================================================
// 🚀 THE MASTER PREDICTION PIPELINE
// ============================================================================

export async function POST() {
  try {
    await connectDB();
    await Prediction.deleteMany({}); // Wipe slate clean

    const predictions: any[] = [];
    const incidents = await Incident.find({}).sort({ createdAt: 1 });

    // 1. Group Data by [Location + Category]
    const historyMap: Record<string, { dates: Date[]; objs: any[] }> = {};
    
    incidents.forEach((inc: any) => {
      // We analyze resolved for patterns, but open ones count for clusters
      const key = `${inc.location.address}|${inc.category}`;
      if (!historyMap[key]) historyMap[key] = { dates: [], objs: [] };
      historyMap[key].dates.push(new Date(inc.createdAt));
      historyMap[key].objs.push(inc);
    });

    // ==========================================
    // PIPELINE A: SINGLE-ASSET FAILURE ANALYSIS
    // ==========================================
    for (const [key, data] of Object.entries(historyMap)) {
      if (data.dates.length < 3) continue; // Need minimum data for math

      const [loc, cat] = key.split("|");
      const dates = data.dates.sort((a, b) => a.getTime() - b.getTime());
      const timestamps = dates.map((d) => d.getTime());
      
      // Calculate Intervals (Days)
      const intervals: number[] = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push((timestamps[i] - timestamps[i - 1]) / DAY_MS);
      }

      // Basic Stats
      const n = intervals.length;
      const med = median(intervals);
      const madVal = mad(intervals);
      const cv = madVal / Math.max(0.01, med); // Coefficient of Variation (Variability)
      
      // Math Models
      const rho = spearmanRho(intervals); // Trend (-1 = shrinking intervals)
      const wb = fitWeibull(intervals); // Wear-out shape
      const seasonality = chiSquareDayOfWeek(dates);
      const holtForecast = doubleExponentialSmoothing(intervals);
      const bootCI = bootstrapIntervals(intervals);

      const lastDate = dates[dates.length - 1];
      const daysSinceLast = (Date.now() - lastDate.getTime()) / DAY_MS;

      // --- CHECK 1: CRITICAL DETERIORATION (The "Dying Elevator" Scenario) ---
      // Logic: Trend is negative (intervals shrinking) and strong
      if (rho < -0.6) {
        predictions.push({
          title: `🚨 CRITICAL: Accelerating Failure Rate`,
          message: `System at ${loc} is failing faster over time (Spearman ρ=${rho.toFixed(2)}). Intervals dropped to ${intervals[intervals.length-1].toFixed(1)} days. Immediate replacement required.`,
          location: loc,
          category: cat,
          severity: "Critical",
          confidenceScore: calculateConfidence(n, cv, 25), // High bonus for strong trend
          algorithm: "Spearman Rank Correlation"
        });
        continue; // Skip other checks for this asset if it's critical
      }

      // --- CHECK 2: WEAR-OUT PHASE (The "Old Machine" Scenario) ---
      // Logic: Weibull Shape (k) > 1.5 means increasing failure rate due to age
      if (wb && wb.k > 1.5 && daysSinceLast > med * 0.8) {
        const hazard = weibullHazard(daysSinceLast, wb.k, wb.lambda);
        predictions.push({
          title: `⚠️ Wear-Out Risk Detected`,
          message: `Equipment is in wear-out phase (Weibull k=${wb.k.toFixed(1)}). Hazard rate is rising. Maintenance recommended before failure.`,
          location: loc,
          category: cat,
          severity: "High",
          confidenceScore: calculateConfidence(n, cv, 15),
          algorithm: "Weibull Reliability Analysis"
        });
      }

      // --- CHECK 3: PRECISE FORECAST (The "Clockwork" Scenario) ---
      // Logic: Low variability + Holt-Winters forecast is impending
      if (cv < 0.3) {
        const nextDate = new Date(lastDate.getTime() + holtForecast * DAY_MS);
        const daysUntil = Math.ceil((nextDate.getTime() - Date.now()) / DAY_MS);
        
        if (daysUntil <= 14 && daysUntil > -5) {
           predictions.push({
            title: `🔮 Predictive Maintenance: ${cat}`,
            message: `Highly consistent pattern. Next failure predicted on ${nextDate.toLocaleDateString()} (±${((bootCI.hi - bootCI.lo)/2).toFixed(1)} days).`,
            location: loc,
            category: cat,
            severity: daysUntil < 3 ? "High" : "Medium",
            confidenceScore: calculateConfidence(n, cv, 20),
            algorithm: "Holt-Winters Exponential Smoothing"
          });
        }
      }

      // --- CHECK 4: SEASONALITY (The "Monday" Scenario) ---
      if (seasonality && seasonality.strength > 0.5) {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        predictions.push({
          title: `📅 Seasonal Pattern: ${days[seasonality.dayIndex]}s`,
          message: `${(seasonality.strength * 100).toFixed(0)}% of ${cat} incidents happen on ${days[seasonality.dayIndex]}. Check scheduled usage or staff shifts.`,
          location: loc,
          category: cat,
          severity: "Medium",
          confidenceScore: 85,
          algorithm: "Chi-Square Seasonality Test"
        });
      }
    }

    // ==========================================
    // PIPELINE B: SPATIAL CLUSTERING (Poisson)
    // ==========================================
    // Logic: Are we seeing way more failures today than average?
    const blockMap: Record<string, { count: number, cats: Set<string> }> = {};
    const todayStr = new Date().toDateString();
    
    incidents.forEach(inc => {
      if (new Date(inc.createdAt).toDateString() === todayStr) {
        // Extract "Block" (first 2 words)
        const block = inc.location.address?.split(" ").slice(0, 2).join(" ") || "Unknown";
        if (!blockMap[block]) blockMap[block] = { count: 0, cats: new Set() };
        blockMap[block].count++;
        blockMap[block].cats.add(inc.category);
      }
    });

    // Calculate global average daily rate (Lambda) roughly
    const uniqueDays = new Set(incidents.map(i => new Date(i.createdAt).toDateString())).size || 1;
    const lambda = incidents.length / uniqueDays / Object.keys(blockMap).length || 1; // Avg per block per day

    Object.entries(blockMap).forEach(([block, data]) => {
      if (data.count >= 3) {
        const pVal = poissonTailProb(Math.max(lambda, 0.5), data.count); // Prob of seeing k events
        if (pVal < 0.05) {
           predictions.push({
            title: `🏢 Infrastructure Cluster Alert`,
            message: `${data.count} failures in ${block} today (Civil, Elec, etc.). Statistically rare (p=${pVal.toFixed(4)}). Likely central infrastructure failure.`,
            location: block,
            category: "General",
            severity: "Critical",
            confidenceScore: 95,
            algorithm: "Poisson Distribution Probability"
          });
        }
      }
    });

    // ==========================================
    // PIPELINE C: CROSS-CATEGORY CORRELATION
    // ==========================================
    // Logic: If Elec fails, does Internet fail 2h later?
    const categories = ["Electricity", "Internet", "Water"];
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        const cat1 = categories[i];
        const cat2 = categories[j];
        
        // Find pairs close in time
        let correlationCount = 0;
        const cat1Events = incidents.filter(x => x.category === cat1);
        const cat2Events = incidents.filter(x => x.category === cat2);

        cat1Events.forEach(e1 => {
          const e1Time = new Date(e1.createdAt).getTime();
          const match = cat2Events.some(e2 => {
            const diff = Math.abs(new Date(e2.createdAt).getTime() - e1Time);
            return diff < 3 * 60 * 60 * 1000; // Within 3 hours
          });
          if (match) correlationCount++;
        });

        if (correlationCount >= 2) {
           predictions.push({
            title: `🔗 Cross-System Correlation`,
            message: `Pattern detected: ${cat1} failures are frequently followed by ${cat2} failures within 3 hours. Check dependency.`,
            location: "Campus Wide",
            category: `${cat1} ↔ ${cat2}`,
            severity: "Medium",
            confidenceScore: 75,
            algorithm: "Temporal Correlation Analysis"
          });
        }
      }
    }

    // Save findings
    if (predictions.length > 0) {
      await Prediction.insertMany(predictions);
    }

    return NextResponse.json({ 
      success: true, 
      generated: predictions.length,
      predictions 
    });

  } catch (error: any) {
    console.error("Prediction Engine Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}