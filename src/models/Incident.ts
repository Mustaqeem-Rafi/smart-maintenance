import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIncident extends Document {
  title: string;
  description: string;
  category: 'Water' | 'Electricity' | 'Internet' | 'Civil' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  location: {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
    address?: string;
  };
  images: string[];
  reportedBy: mongoose.Types.ObjectId; // Reference to User
  assignedTo?: mongoose.Types.ObjectId; // Reference to Technician
  createdAt: Date;
  resolvedAt?: Date;
}

const IncidentSchema: Schema<IIncident> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Water', 'Electricity', 'Internet', 'Civil', 'Other'],
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved'], 
    default: 'Open' 
  },
  location: {
    type: { type: String, default: 'Point', enum: ['Point'] },
    coordinates: { type: [Number], required: true }, // [long, lat]
    address: String
  },
  images: [String],
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date
});

// Geospatial Index for Heatmap/Duplicate Detection
IncidentSchema.index({ location: '2dsphere' });

const Incident: Model<IIncident> = mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);

export default Incident;