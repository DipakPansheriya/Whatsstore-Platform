import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ICart extends Document {
  sessionId: string;
  business: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  isConverted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true, min: 0 },
});

const CartSchema = new Schema<ICart>(
  {
    sessionId:   { type: String, required: true },
    business:    { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    items:       { type: [CartItemSchema], default: [] },
    totalAmount: { type: Number, default: 0, min: 0 },
    isConverted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create compound index so that session + business is unique
CartSchema.index({ sessionId: 1, business: 1 }, { unique: true });

export default mongoose.model<ICart>('Cart', CartSchema);
