import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  store: mongoose.Types.ObjectId;
  plan?: mongoose.Types.ObjectId;
  status: 'TRIAL_ACTIVE' | 'TRIAL_EXPIRED' | 'PAYMENT_PENDING' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
  trialStartDate: Date;
  trialEndDate: Date;
  startDate?: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    store: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    plan: { type: Schema.Types.ObjectId, ref: 'Plan' },
    status: { 
      type: String, 
      enum: ['TRIAL_ACTIVE', 'TRIAL_EXPIRED', 'PAYMENT_PENDING', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED'], 
      default: 'TRIAL_ACTIVE' 
    },
    trialStartDate: { type: Date, required: true },
    trialEndDate: { type: Date, required: true },
    startDate: { type: Date },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
