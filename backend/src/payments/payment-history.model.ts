import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentHistory extends Document {
  user: mongoose.Types.ObjectId;
  store: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  paymentDate: Date;
  referenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentHistorySchema = new Schema<IPaymentHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    store: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    plan: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'SUCCESS' },
    paymentDate: { type: Date, default: Date.now },
    referenceId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPaymentHistory>('PaymentHistory', PaymentHistorySchema);
