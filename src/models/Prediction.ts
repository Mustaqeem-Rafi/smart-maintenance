import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPrediction extends Document {
  title: string;           // e.g. "CRITICAL: System Deterioration"
  message: string;         // Detailed explanation with stats
  location: string;        // "Hostel C"
  category: string;        // "Water"
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidenceScore: number; // 0-100
  algorithm?: string;      // "Weibull Analysis", etc.
  predictedDate?: Date;    // The specific date predicted (optional)
  metadata?: any;          // Extra stats (R-squared, P-value) for debugging
  createdAt: Date;
}

const PredictionSchema: Schema<IPrediction> = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['Critical', 'High', 'Medium', 'Low'], 
    required: true 
  },
  confidenceScore: { type: Number, required: true },
  algorithm: { type: String },
  predictedDate: { type: Date },
  metadata: { type: Schema.Types.Mixed }, // Flexible field for any extra math data
  createdAt: { type: Date, default: Date.now }
});

// Prevent model overwrite during hot-reloads
const Prediction: Model<IPrediction> = mongoose.models.Prediction || mongoose.model<IPrediction>('Prediction', PredictionSchema);

export default Prediction;