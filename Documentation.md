# **Smart Maintenance System \- Technical Documentation**

## **1\. AI & Prediction Logic (The "Brain")**

The core of the Smart Maintenance platform is a deterministic statistical engine designed to predict infrastructure failures before they happen. Unlike black-box ML models, our engine uses specific mathematical models to analyze historical incident patterns.

**Location:** src/app/api/predictions/run/route.ts

### **Algorithms Implemented**

| Algorithm | Purpose | Trigger Condition | Output |
| :---- | :---- | :---- | :---- |
| **Weibull Survival Analysis** | Reliability Engineering | Analyzes the "age" of equipment (time since last repair). | **"Wear-Out Risk"**: Predicts probability of failure based on aging curves. |
| **Holt-Winters Exponential Smoothing** | Trend Forecasting | Detects if failure intervals are consistently shrinking (e.g., 10 days → 7 days → 4 days). | **"Critical Deterioration"**: Flags assets that are failing faster over time. |
| **Monte Carlo Simulation** | Confidence Intervals | Runs 1,000 simulations on historical intervals to determine forecast variance. | **"High-Confidence Forecast"**: Predicts exact failure dates (e.g., "Next failure on Nov 24th ±1 day"). |
| **Chi-Square Seasonality Test** | Pattern Recognition | Checks if failures cluster on specific days (e.g., Mondays). | **"Seasonal Pattern"**: Identifies usage-based failures (e.g., Gym AC fails after weekends). |
| **Poisson Distribution** | Anomaly Detection | Compares current daily failure rate against historical baselines. | **"Infrastructure Cluster Alert"**: Detects systemic failures (e.g., 5 electrical issues in Block A in 2 hours). |
| **Spearman Rank Correlation** | Trend Analysis | Measures the strength and direction of monotonic trends in failure data. | Used to validate deterioration alerts with a confidence score. |

## **2\. Task Scheduling Logic (The "Dispatcher")**

The system uses an intelligent "Round-Robin \+ Load Balancing" algorithm to assign technicians to tickets automatically. This ensures fair distribution of work and adherence to SLAs.

**Location:** src/app/api/incidents/assign/auto/route.ts

### **Assignment Workflow**

1. **Specialty Filtering:**  
   * The system first filters the pool of Technicians based on the Incident Category.  
   * *Example:* A "Water" incident only looks for Technicians in the "Plumbing" department.  
   * *Fallback:* If no specialist is found, it widens the search to "General" staff.  
2. **Availability Check:**  
   * Technicians marked as isAvailable: false (Offline/On Leave) are excluded immediately.  
3. **Load Balancing Score:**  
   * The system calculates a "Load Score" for each candidate:  
     Score \= (Active Tasks Count) \+ (Urgency Weight)

   * Technicians are sorted ascending by this score.  
4. **Winner Selection:**  
   * The technician with the **lowest active workload** is assigned the ticket.  
   * Status updates to In Progress.  
   * A notification is sent to the Reporter.

## **3\. Routine Flow (User Journeys)**

### **A. Student / Staff (Reporter)**

1. **Log In:** Secure authentication via NextAuth.  
2. **Report Incident:**  
   * **Category Selection:** User picks broad category (Water, Electric, IT).  
   * **GPS Lock:** System captures precise Lat/Long coordinates.  
   * **Details:** Title, Description, and optional photo evidence.  
   * **Review:** Final confirmation before submission.  
3. **Track Status:** Real-time timeline view (Reported → Assigned → In Progress → Resolved).

### **B. Technician (Resolver)**

1. **Log In:** Redirected strictly to the Job Queue.  
2. **Dashboard:** View list of assigned tasks, prioritized by "SLA Breach Risk" and "Priority".  
3. **Action:**  
   * Click **"Accept & Start"** to change status to In Progress.  
   * Click **"Mark Complete"** to resolve the ticket.  
4. **Update Availability:** Toggle "Online/Offline" status from profile.

### **C. Admin (Controller)**

1. **Dashboard:** View live Heatmap of campus hotspots and high-level stats.  
2. **AI Diagnostics:** Click "Run Diagnostics" to trigger the Python-free prediction engine.  
3. **Incident Management:** View all tickets, manually override assignments, or delete invalid reports.  
4. **User Management:** Add/Remove Technicians and monitor performance.

## **4\. Database Schema (MongoDB)**

The application uses **Mongoose** for strict schema validation.

### **User Collection**

| Field | Type | Description |
| :---- | :---- | :---- |
| \_id | ObjectId | Unique Identifier |
| name | String | Full Name |
| email | String | Unique Email (Primary Key for Auth) |
| password | String | Hashed Password (bcrypt) |
| role | Enum | \`'student' |
| department | String | (Technicians only) e.g., 'Electrical' |
| isAvailable | Boolean | (Technicians only) Status toggle |

### **Incident Collection**

| Field | Type | Description |
| :---- | :---- | :---- |
| title | String | Brief summary |
| category | Enum | \`'Water' |
| priority | Enum | \`'High' |
| status | Enum | \`'Open' |
| location | GeoJSON | { type: "Point", coordinates: \[long, lat\] } |
| reportedBy | Ref(User) | Link to student who reported |
| assignedTo | Ref(User) | Link to technician assigned |
| createdAt | Date | Timestamp for aging analysis |

### **Prediction Collection (AI Output)**

| Field | Type | Description |
| :---- | :---- | :---- |
| title | String | Alert Header (e.g., "CRITICAL: System Deterioration") |
| severity | Enum | \`'Critical' |
| confidence | Number | 0-100 Score based on data variance |
| algorithm | String | Name of the math model that triggered this alert |
| location | String | Target block/room |
| metadata | Object | Extra stats (R-squared value, P-value) |

### **Notification Collection**

| Field | Type | Description |
| :---- | :---- | :---- |
| userId | Ref(User) | Recipient |
| message | String | Content |
| type | Enum | \`'assigned' |
| isRead | Boolean | Read status |

## **5\. Tech Stack**

* **Framework:** Next.js 15 (App Router)  
* **Language:** TypeScript  
* **Database:** MongoDB (Mongoose ODM)  
* **Styling:** Tailwind CSS  
* **Auth:** NextAuth.js  
* **Maps:** Leaflet (OpenStreetMap)  
* **Icons:** Lucide React