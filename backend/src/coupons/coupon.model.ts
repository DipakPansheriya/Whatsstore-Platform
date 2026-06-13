import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  business: mongoose.Types.ObjectId;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate?: Date;
  expiryDate?: Date;
  isActive: boolean;
  visibility: 'PUBLIC' | 'PRIVATE';
  displayOnStore: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    business:      { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    code:          { type: String, required: true, uppercase: true, trim: true },
    discountType:  { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    startDate:     { type: Date },
    expiryDate:    { type: Date },
    isActive:      { type: Boolean, default: true },
    visibility:     { type: String, enum: ['PUBLIC', 'PRIVATE'], default: 'PRIVATE' },
    displayOnStore: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Enforce unique coupon code per business
CouponSchema.index({ business: 1, code: 1 }, { unique: true });

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
