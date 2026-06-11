import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  business: mongoose.Types.ObjectId;
  event: 'page_view' | 'product_click' | 'whatsapp_click' | 'coupon_view' | 'coupon_copy' | 'coupon_apply';
  product?: mongoose.Types.ObjectId;
  couponCode?: string;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    event: { type: String, enum: ['page_view', 'product_click', 'whatsapp_click', 'coupon_view', 'coupon_copy', 'coupon_apply'], required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    couponCode: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
