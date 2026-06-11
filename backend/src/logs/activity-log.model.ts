import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  module: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED';
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g. "Login", "Product Created"
    module: { type: String, required: true }, // e.g. "Auth", "Products", "SuperAdmin"
    ipAddress: { type: String, default: 'unknown' },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
    details: { type: String }, // Optional JSON string or extra info
  },
  { timestamps: true }
);

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
