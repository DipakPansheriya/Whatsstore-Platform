import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  rating: number;
  name: string;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    name:    { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true },
    status:  { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
