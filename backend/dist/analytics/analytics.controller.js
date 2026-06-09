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
        // Total counts by event
        const pageViews = await analytics_model_1.default.countDocuments({ business: businessId, event: 'page_view' });
        const productClicks = await analytics_model_1.default.countDocuments({ business: businessId, event: 'product_click' });
        const whatsappClicks = await analytics_model_1.default.countDocuments({ business: businessId, event: 'whatsapp_click' });
        // Conversion rate
        const conversionRate = pageViews > 0 ? Number(((whatsappClicks / pageViews) * 100).toFixed(1)) : 0;
        // Orders stats
        const totalOrders = await orders_model_1.default.countDocuments({ business: businessId });
        const totalSalesArr = await orders_model_1.default.aggregate([
            { $match: { business: businessId, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalSales = totalSalesArr.length > 0 ? totalSalesArr[0].total : 0;
        // Popular products stats
        const popularProducts = await analytics_model_1.default.aggregate([
            { $match: { business: businessId, event: 'product_click', product: { $exists: true } } },
            { $group: { _id: '$product', clicks: { $sum: 1 } } },
            { $sort: { clicks: -1 } },
            { $limit: 5 }
        ]);
        // Populate product titles
        const populatedProducts = await Promise.all(popularProducts.map(async (item) => {
            const prod = await products_model_1.default.findById(item._id).select('title price');
            return {
                id: item._id,
                title: prod ? prod.title : 'Deleted Product',
                price: prod ? prod.price : 0,
                clicks: item.clicks
            };
        }));
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
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAnalyticsDashboard = getAnalyticsDashboard;
