import { Request, Response } from 'express';
import { MarketplaceConfig, MarketplaceSearchLog } from './marketplace.model';
import Business from '../business/business.model';
import Product from '../products/products.model';
import Coupon from '../coupons/coupon.model';
import Order from '../orders/orders.model';
import Review from '../reviews/reviews.model';

// Helper to seed and return default config if none exists
const getOrCreateConfig = async () => {
  let config = await MarketplaceConfig.findOne();
  if (!config) {
    config = await MarketplaceConfig.create({
      featuredStores: [],
      featuredProducts: [],
      banners: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
          title: 'Welcome to WhatsStore Marketplace',
          linkUrl: '/marketplace'
        }
      ],
      categories: [
        { name: 'Electronics', iconUrl: '🔌' },
        { name: 'Fashion', iconUrl: '👕' },
        { name: 'Grocery', iconUrl: '🛒' },
        { name: 'Restaurant', iconUrl: '🍔' },
        { name: 'Beauty', iconUrl: '💅' },
        { name: 'Furniture', iconUrl: '🛋️' },
        { name: 'Services', iconUrl: '🛠️' }
      ]
    });
  }
  return config;
};

/** GET /api/marketplace/config (Public) */
export const getMarketplaceConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await getOrCreateConfig();
    res.json({ success: true, config });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/marketplace/home (Public) */
export const getMarketplaceHome = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await getOrCreateConfig();

    // Dynamic Featured Stores Calculation
    // Score = Total Orders + Total Revenue (scaled) + Total Products Sold + Store Rating
    const storeStats = await Order.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$business",
          ordersCount: { $addToSet: "$_id" }, // count distinct orders
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          productsSold: { $sum: "$items.quantity" }
        }
      },
      {
        $project: {
          business: "$_id",
          totalOrders: { $size: "$ordersCount" },
          totalRevenue: 1,
          productsSold: 1
        }
      }
    ]);

    const reviewStats = await Review.aggregate([
      { $match: { status: 'APPROVED' } },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'prod' } },
      { $unwind: "$prod" },
      {
        $group: {
          _id: "$prod.business",
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    const allStores = await Business.find({ isPublished: true }).select('name logoUrl websiteSlug category description phone');
    const featuredStores = allStores.map(store => {
      const stats = storeStats.find(s => s._id.toString() === store._id.toString());
      const rev = reviewStats.find(r => r._id.toString() === store._id.toString());

      const orders = stats?.totalOrders || 0;
      const revenue = stats?.totalRevenue || 0;
      const sold = stats?.productsSold || 0;
      const rating = rev?.avgRating || 0;

      // Calculate score (scaled revenue down so it doesn't vastly overpower other metrics)
      const score = orders + (revenue / 100) + sold + (rating * 10);

      return {
        ...store.toObject(),
        stats: { orders, revenue, sold, rating },
        score
      };
    })
      .sort((a, b) => b.stats.orders - a.stats.orders)
      .slice(0, 10); // top 10 stores

    // Dynamic Curated Products (Highest Quantity Sold)
    const topProductsAgg = await Order.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          quantitySold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 12 }
    ]);

    const topProductIds = topProductsAgg.map(p => p._id);
    let featuredProductsRaw = await Product.find({ _id: { $in: topProductIds }, isAvailable: true })
      .populate('business', 'name logoUrl websiteSlug');

    const featuredProducts = featuredProductsRaw.map(p => {
      const agg = topProductsAgg.find(a => a._id.toString() === p._id.toString());
      return {
        ...p.toObject(),
        salesCount: agg?.quantitySold || 0
      };
    }).sort((a, b) => b.salesCount - a.salesCount);

    // Fetch published stores IDs for filtering other sections
    const activeBusinesses = await Business.find({ isPublished: true }).select('_id');
    const activeBusinessIds = activeBusinesses.map(b => b._id);

    // Fetch trending products (newest 12 items across active stores)
    const trendingProducts = await Product.find({
      business: { $in: activeBusinessIds },
      isAvailable: true
    })
      .populate('business', 'name logoUrl websiteSlug')
      .sort({ createdAt: -1 })
      .limit(12);

    // Fetch active public coupons across active stores
    const now = new Date();
    const globalCoupons = await Coupon.find({
      business: { $in: activeBusinessIds },
      visibility: 'PUBLIC',
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gt: now } }
      ]
    })
      .populate('business', 'name logoUrl websiteSlug')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      banners: config.banners,
      categories: config.categories,
      featuredStores,
      featuredProducts,
      trendingProducts,
      globalCoupons
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/marketplace/search (Public) */
export const searchMarketplace = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    const category = req.query.category as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 16;
    const skip = (page - 1) * limit;

    const activeBusinesses = await Business.find({ isPublished: true }).select('_id');
    const activeBusinessIds = activeBusinesses.map(b => b._id);

    const filter: any = {
      business: { $in: activeBusinessIds },
      isAvailable: true
    };

    if (category && category.toLowerCase() !== 'all') {
      filter.category = new RegExp(category.trim(), 'i');
    }

    let products = [];
    let total = 0;

    if (q && q.trim().length > 0) {
      const searchTerms = q.trim();

      // Find published stores whose names match search terms
      const matchingBizs = await Business.find({
        isPublished: true,
        name: { $regex: searchTerms, $options: 'i' }
      }).select('_id');
      const matchingBizIds = matchingBizs.map(b => b._id);

      // Match product title, product description, or store name
      filter.$or = [
        { title: { $regex: searchTerms, $options: 'i' } },
        { description: { $regex: searchTerms, $options: 'i' } },
        { business: { $in: matchingBizIds } }
      ];

      // Log search queries to statistics
      if (searchTerms.length > 1) {
        const normalized = searchTerms.toLowerCase();
        await MarketplaceSearchLog.findOneAndUpdate(
          { query: normalized },
          { $inc: { count: 1 }, $set: { lastSearchedAt: new Date() } },
          { upsert: true, new: true }
        );
      }

      total = await Product.countDocuments(filter);
      products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('business', 'name logoUrl websiteSlug');
    } else {
      total = await Product.countDocuments(filter);
      products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('business', 'name logoUrl websiteSlug');
    }

    // Embed available coupons for each product's business
    const now = new Date();
    const productsWithCoupons = await Promise.all(
      products.map(async (prod) => {
        const coupons = await Coupon.find({
          business: prod.business._id,
          visibility: 'PUBLIC',
          isActive: true,
          $or: [
            { expiryDate: { $exists: false } },
            { expiryDate: null },
            { expiryDate: { $gt: now } }
          ]
        }).select('code discountType discountValue');

        return {
          ...prod.toObject(),
          coupons
        };
      })
    );

    res.json({
      success: true,
      products: productsWithCoupons,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/marketplace/admin/analytics (Superadmin only) */
export const getSuperAdminAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchLogs = await MarketplaceSearchLog.find()
      .sort({ count: -1 })
      .limit(30);

    res.json({ success: true, searchLogs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/marketplace/admin/config (Superadmin only) */
export const updateMarketplaceConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { banners, categories, featuredStores, featuredProducts } = req.body;
    let config = await MarketplaceConfig.findOne();

    if (!config) {
      config = new MarketplaceConfig();
    }

    if (banners) config.banners = banners;
    if (categories) config.categories = categories;
    if (featuredStores) config.featuredStores = featuredStores;
    if (featuredProducts) config.featuredProducts = featuredProducts;

    await config.save();

    res.json({ success: true, message: 'Marketplace config updated successfully', config });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
