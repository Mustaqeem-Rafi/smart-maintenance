import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  incidentId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema({
  incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
export default Message;