import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for a Complaint document
export interface IComplaint extends Document {
  studentId: string; // To link to the student profile
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
  category: 'Infrastructure' | 'Academic' | 'Administrative' | 'Other';
  dateSubmitted: Date;
  lastUpdated: Date;
}

// Define the Mongoose Schema
const ComplaintSchema: Schema = new Schema({
  studentId: { type: String, required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending',
  },
  category: { 
    type: String, 
    enum: ['Infrastructure', 'Academic', 'Administrative', 'Other'],
    required: true,
  },
  dateSubmitted: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

// Check if the model already exists to prevent overwrite errors during hot reloading
const Complaint = (mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema));

export default Complaint as mongoose.Model<IComplaint>;