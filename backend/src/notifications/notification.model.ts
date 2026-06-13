import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 
  | 'ORDER_NEW' 
  | 'REVIEW_NEW' 
  | 'SUBSCRIPTION_EXPIRING' 
  | 'PRODUCT_OUT_OF_STOCK'
  | 'USER_NEW'
  | 'STORE_NEW'
  | 'SUBSCRIPTION_PURCHASED'
  | 'STORE_SUSPENDED'
  | 'SYSTEM_ALERT';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; // User ID
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string; // e.g. Order ID, Review ID, Product ID
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:      { type: String, required: true },
    title:     { type: String, required: true },
    message:   { type: String, required: true },
    isRead:    { type: Boolean, default: false },
    relatedId: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes for faster queries
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
