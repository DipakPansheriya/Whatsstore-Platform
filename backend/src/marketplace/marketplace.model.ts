import mongoose, { Document, Schema } from 'mongoose';

export interface IMarketplaceConfig extends Document {
  featuredStores: mongoose.Types.ObjectId[];
  featuredProducts: mongoose.Types.ObjectId[];
  banners: {
    imageUrl: string;
    title?: string;
    linkUrl?: string;
  }[];
  categories: {
    name: string;
    iconUrl?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceConfigSchema = new Schema<IMarketplaceConfig>(
  {
    featuredStores:   [{ type: Schema.Types.ObjectId, ref: 'Business' }],
    featuredProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    banners: [
      {
        imageUrl: { type: String, required: true },
        title:    { type: String, default: '' },
        linkUrl:  { type: String, default: '' }
      }
    ],
    categories: [
      {
        name:    { type: String, required: true },
        iconUrl: { type: String, default: '' }
      }
    ]
  },
  { timestamps: true }
);

export interface IMarketplaceSearchLog extends Document {
  query: string;
  count: number;
  lastSearchedAt: Date;
}

const MarketplaceSearchLogSchema = new Schema<IMarketplaceSearchLog>(
  {
    query:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    count:          { type: Number, default: 1 },
    lastSearchedAt: { type: Date, default: Date.now }
  }
);

MarketplaceSearchLogSchema.index({ count: -1 });

export const MarketplaceConfig = mongoose.model<IMarketplaceConfig>('MarketplaceConfig', MarketplaceConfigSchema);
export const MarketplaceSearchLog = mongoose.model<IMarketplaceSearchLog>('MarketplaceSearchLog', MarketplaceSearchLogSchema);
