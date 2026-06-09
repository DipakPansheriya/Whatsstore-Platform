import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  business: mongoose.Types.ObjectId;
  event: 'page_view' | 'product_click' | 'whatsapp_click';
  product?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    event:    { type: String, enum: ['page_view', 'product_click', 'whatsapp_click'], required: true },
    product:  { type: Schema.Types.ObjectId, ref: 'Product' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
