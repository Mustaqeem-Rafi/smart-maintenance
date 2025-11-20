import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin' | 'technician';
  department?: string;
  isAvailable?: boolean; // For technicians
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Enforces unique accounts
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'admin', 'technician'], 
    default: 'student',
    required: true
  },
  department: { type: String },
  isAvailable: { type: Boolean, default: true }, // Critical for "Assign technicians intelligently"
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite during hot-reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;