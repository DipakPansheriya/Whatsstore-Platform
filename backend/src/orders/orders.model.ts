import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  business: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const OrderSchema = new Schema<IOrder>(
  {
    business:         { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    customerName:     { type: String, required: true },
    customerPhone:    { type: String, required: true },
    customerWhatsapp: { type: String, required: true },
    items:            { type: [OrderItemSchema], required: true },
    totalAmount:      { type: Number, required: true, min: 0 },
    status:           { type: String, enum: ['pending','confirmed','processing','shipped','delivered','cancelled'], default: 'pending' },
    notes:            { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
