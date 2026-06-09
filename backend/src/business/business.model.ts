import mongoose, { Document, Schema } from 'mongoose';

export interface IBusiness extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  email: string;
  description: string;
  phone: string;
  whatsappNumber: string;
  logoUrl: string;
  address: string;
  category: string;
  websiteSlug: string;
  isPublished: boolean;
  layoutConfig: {
    template: string;
    theme: string;
    heroTitle: string;
    heroSubtitle: string;
    heroImageUrl: string;
    aboutTitle: string;
    aboutText: string;
    ctaTitle: string;
  };
  createdAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    owner:           { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name:            { type: String, required: true, trim: true },
    email:           { type: String, required: true, lowercase: true, trim: true },
    description:     { type: String, default: '' },
    phone:           { type: String, required: true },
    whatsappNumber:  { type: String, required: true },
    logoUrl:         { type: String, default: '' },
    address:         { type: String, default: '' },
    category:        { type: String, default: 'General' },
    websiteSlug:     { type: String, unique: true, lowercase: true, trim: true },
    isPublished:     { type: Boolean, default: false },
    layoutConfig: {
      template:     { type: String, default: 'Shop' },
      theme:        { type: String, default: 'Classic Green' },
      heroTitle:    { type: String, default: 'Welcome to our store' },
      heroSubtitle: { type: String, default: 'Browse our products and order easily via WhatsApp.' },
      heroImageUrl: { type: String, default: '' },
      aboutTitle:   { type: String, default: 'About Us' },
      aboutText:    { type: String, default: 'We are a small business dedicated to providing premium quality products.' },
      ctaTitle:     { type: String, default: 'Have questions? Chat with us!' },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBusiness>('Business', BusinessSchema);
