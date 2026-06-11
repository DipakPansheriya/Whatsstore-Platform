"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsDashboard = exports.trackEvent = void 0;
const analytics_model_1 = __importDefault(require("./analytics.model"));
const business_model_1 = __importDefault(require("../business/business.model"));
const products_model_1 = __importDefault(require("../products/products.model"));
const orders_model_1 = __importDefault(require("../orders/orders.model"));
const cart_model_1 = __importDefault(require("../cart/cart.model"));
/** POST /api/analytics/track — Public track page view or click event */
const trackEvent = async (req, res) => {
    try {
        const { businessId, event, productId } = req.body;
        if (!businessId || !event) {
            res.status(400).json({ success: false, message: 'businessId and event type are required' });
            return;
        }
        const analytics = await analytics_model_1.default.create({
            business: businessId,
            event,
            product: productId || undefined
        });
        res.status(201).json({ success: true, analytics });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.trackEvent = trackEvent;
/** GET /api/analytics/dashboard — Protected get merchant analytics */
const getAnalyticsDashboard = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const business = await business_model_1.default.findOne({ owner: userId });
        if (!business) {
            res.status(404).json({ success: false, message: 'Business not found' });
            return;
        }
        const businessId = business._id;
        // 1. Page views count
        const pageViews = await analytics_model_1.default.countDocuments({ business: businessId, event: 'page_view' });
        // 2. WhatsApp Clicks count
        const whatsappClicks = await analytics_model_1.default.countDocuments({ business: businessId, event: 'whatsapp_click' });
        // 3. Total Products
        const totalProducts = await products_model_1.default.countDocuments({ business: businessId });
        // 4. Total Orders
        const totalOrders = await orders_model_1.default.countDocuments({ business: businessId });
        // 5. Total Revenue (exclude cancelled orders)
        const totalSalesArr = await orders_model_1.default.aggregate([
            { $match: { business: businessId, status: { $ne: 'CANCELLED' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalSales = totalSalesArr.length > 0 ? totalSalesArr[0].total : 0;
        // 6. Conversion Rate (Total Orders / Page Views * 100)
        const conversionRate = pageViews > 0 ? Number(((totalOrders / pageViews) * 100).toFixed(1)) : 0;
        // 7. Cart Abandonment Rate
        const totalCarts = await cart_model_1.default.countDocuments({ business: businessId });
        const convertedCarts = await cart_model_1.default.countDocuments({ business: businessId, isConverted: true });
        const cartAbandonmentRate = totalCarts > 0 ? Number((((totalCarts - convertedCarts) / totalCarts) * 100).toFixed(1)) : 0;
        // 8. Monthly Growth (Revenue current month vs previous month)
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const thisMonthRevenueArr = await orders_model_1.default.aggregate([
            { $match: { business: businessId, status: { $ne: 'CANCELLED' }, createdAt: { $gte: startOfThisMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const thisMonthRevenue = thisMonthRevenueArr.length > 0 ? thisMonthRevenueArr[0].total : 0;
        const lastMonthRevenueArr = await orders_model_1.default.aggregate([
            { $match: { business: businessId, status: { $ne: 'CANCELLED' }, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const lastMonthRevenue = lastMonthRevenueArr.length > 0 ? lastMonthRevenueArr[0].total : 0;
        let monthlyGrowth = 0;
        if (lastMonthRevenue > 0) {
            monthlyGrowth = Number((((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1));
        }
        else if (thisMonthRevenue > 0) {
            monthlyGrowth = 100.0;
        }
        // 9. Top Selling Products
        const topSellingProductsAgg = await orders_model_1.default.aggregate([
            { $match: { business: businessId, status: { $ne: 'CANCELLED' } } },
            { $unwind: '$items' },
            { $group: { _id: '$items.product', totalQty: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
            { $sort: { totalQty: -1 } },
            { $limit: 5 }
        ]);
        const topSellingProducts = await Promise.all(topSellingProductsAgg.map(async (item) => {
            const prod = await products_model_1.default.findById(item._id).select('title price images');
            return {
                id: item._id,
                title: prod ? prod.title : 'Deleted Product',
                price: prod ? prod.price : 0,
                image: prod && prod.images && prod.images.length > 0 ? prod.images[0] : '',
                totalQty: item.totalQty,
                revenue: item.revenue
            };
        }));
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
            topSellingProducts
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAnalyticsDashboard = getAnalyticsDashboard;
