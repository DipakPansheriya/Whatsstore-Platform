import { Request, Response } from 'express';
import Analytics from './analytics.model';
import Business from '../business/business.model';
import Product from '../products/products.model';
import Order from '../orders/orders.model';

/** POST /api/analytics/track — Public track page view or click event */
export const trackEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId, event, productId } = req.body;
    if (!businessId || !event) {
      res.status(400).json({ success: false, message: 'businessId and event type are required' });
      return;
    }
    const analytics = await Analytics.create({
      business: businessId,
      event,
      product: productId || undefined
    });
    res.status(201).json({ success: true, analytics });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/analytics/dashboard — Protected get merchant analytics */
export const getAnalyticsDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }

    const businessId = business._id;

    // Total counts by event
    const pageViews = await Analytics.countDocuments({ business: businessId, event: 'page_view' });
    const productClicks = await Analytics.countDocuments({ business: businessId, event: 'product_click' });
    const whatsappClicks = await Analytics.countDocuments({ business: businessId, event: 'whatsapp_click' });

    // Conversion rate
    const conversionRate = pageViews > 0 ? Number(((whatsappClicks / pageViews) * 100).toFixed(1)) : 0;

    // Orders stats
    const totalOrders = await Order.countDocuments({ business: businessId });
    const totalSalesArr = await Order.aggregate([
      { $match: { business: businessId, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = totalSalesArr.length > 0 ? totalSalesArr[0].total : 0;

    // Popular products stats
    const popularProducts = await Analytics.aggregate([
      { $match: { business: businessId, event: 'product_click', product: { $exists: true } } },
      { $group: { _id: '$product', clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
      { $limit: 5 }
    ]);

    // Populate product titles
    const populatedProducts = await Promise.all(
      popularProducts.map(async (item) => {
        const prod = await Product.findById(item._id).select('title price');
        return {
          id: item._id,
          title: prod ? prod.title : 'Deleted Product',
          price: prod ? prod.price : 0,
          clicks: item.clicks
        };
      })
    );

    res.json({
      success: true,
      stats: {
        pageViews,
        productClicks,
        whatsappClicks,
        conversionRate,
        totalOrders,
        totalSales
      },
      popularProducts: populatedProducts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
