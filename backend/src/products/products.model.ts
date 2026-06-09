import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  business: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  stock: number;
  isAvailable: boolean;
  featured: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    business:      { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    title:         { type: String, required: true, trim: true },
    description:   { type: String, default: '' },
    price:         { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images:        { type: [String], default: [] },
    category:      { type: String, default: 'General' },
    stock:         { type: Number, default: 0, min: 0 },
    isAvailable:   { type: Boolean, default: true },
    featured:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
