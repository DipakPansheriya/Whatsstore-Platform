import { Request, Response } from 'express';
import Analytics from './analytics.model';
import Business from '../business/business.model';
import Product from '../products/products.model';
import Order from '../orders/orders.model';
import Cart from '../cart/cart.model';

/** POST /api/analytics/track — Public track page view or click event */
export const trackEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId, event, productId, couponCode } = req.body;
    if (!businessId || !event) {
      res.status(400).json({ success: false, message: 'businessId and event type are required' });
      return;
    }
    const analytics = await Analytics.create({
      business: businessId,
      event,
      product: productId || undefined,
      couponCode: couponCode || undefined
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

    // 1. Page views count
    const pageViews = await Analytics.countDocuments({ business: businessId, event: 'page_view' });

    // 2. WhatsApp Clicks count
    const whatsappClicks = await Analytics.countDocuments({ business: businessId, event: 'whatsapp_click' });

    // 3. Total Products
    const totalProducts = await Product.countDocuments({ business: businessId });

    // 4. Total Orders
    const totalOrders = await Order.countDocuments({ business: businessId });

    // 5. Total Revenue (exclude cancelled orders)
    const totalSalesArr = await Order.aggregate([
      { $match: { business: businessId, status: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = totalSalesArr.length > 0 ? totalSalesArr[0].total : 0;

    // 6. Conversion Rate (Total Orders / Page Views * 100)
    const conversionRate = pageViews > 0 ? Number(((totalOrders / pageViews) * 100).toFixed(1)) : 0;

    // 7. Cart Abandonment Rate
    const totalCarts = await Cart.countDocuments({ business: businessId });
    const convertedCarts = await Cart.countDocuments({ business: businessId, isConverted: true });
    const cartAbandonmentRate = totalCarts > 0 ? Number((((totalCarts - convertedCarts) / totalCarts) * 100).toFixed(1)) : 0;

    // 8. Monthly Growth (Revenue current month vs previous month)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const thisMonthRevenueArr = await Order.aggregate([
      { $match: { business: businessId, status: { $ne: 'CANCELLED' }, createdAt: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const thisMonthRevenue = thisMonthRevenueArr.length > 0 ? thisMonthRevenueArr[0].total : 0;

    const lastMonthRevenueArr = await Order.aggregate([
      { $match: { business: businessId, status: { $ne: 'CANCELLED' }, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const lastMonthRevenue = lastMonthRevenueArr.length > 0 ? lastMonthRevenueArr[0].total : 0;

    let monthlyGrowth = 0;
    if (lastMonthRevenue > 0) {
      monthlyGrowth = Number((((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1));
    } else if (thisMonthRevenue > 0) {
      monthlyGrowth = 100.0;
    }

    // 9. Top Selling Products
    const topSellingProductsAgg = await Order.aggregate([
      { $match: { business: businessId, status: { $ne: 'CANCELLED' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalQty: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 }
    ]);

    const topSellingProducts = await Promise.all(
      topSellingProductsAgg.map(async (item) => {
        const prod = await Product.findById(item._id).select('title price images');
        return {
          id: item._id,
          title: prod ? prod.title : 'Deleted Product',
          price: prod ? prod.price : 0,
          image: prod && prod.images && prod.images.length > 0 ? prod.images[0] : '',
          totalQty: item.totalQty,
          revenue: item.revenue
        };
      })
    );

    // 10. Coupon Performance Leaderboard (Most Used, Conversions, Revenue Impact)
    const couponStats = await Order.aggregate([
      { $match: { business: businessId, couponCode: { $ne: '' }, status: { $ne: 'CANCELLED' } } },
      { $group: {
          _id: '$couponCode',
          useCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalDiscount: { $sum: '$discountAmount' }
        }
      },
      { $sort: { useCount: -1 } }
    ]);

    const couponSummary = await Promise.all(
      couponStats.map(async (stat) => {
        const applies = await Analytics.countDocuments({ business: businessId, event: 'coupon_apply', couponCode: stat._id });
        const conversionRate = applies > 0 ? Number(((stat.useCount / applies) * 100).toFixed(1)) : 100.0;
        return {
          code: stat._id,
          useCount: stat.useCount,
          revenue: stat.totalRevenue,
          discount: stat.totalDiscount,
          conversionRate: Math.min(conversionRate, 100.0)
        };
      })
    );

    res.json({
      success: true,
      stats: {
        pageViews,
        whatsappClicks,
        totalProducts,
        totalOrders,
        totalSales,
        conversionRate,
        cartAbandonmentRate,
        monthlyGrowth
      },
      topSellingProducts,
      couponSummary
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
