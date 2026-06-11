"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = __importDefault(require("./config/db"));
// Routes
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const business_routes_1 = __importDefault(require("./business/business.routes"));
const products_routes_1 = __importDefault(require("./products/products.routes"));
const orders_routes_1 = __importDefault(require("./orders/orders.routes"));
const reviews_routes_1 = __importDefault(require("./reviews/reviews.routes"));
const analytics_routes_1 = __importDefault(require("./analytics/analytics.routes"));
const superadmin_routes_1 = __importDefault(require("./superadmin/superadmin.routes"));
const plan_routes_1 = __importDefault(require("./plans/plan.routes"));
const subscription_routes_1 = __importDefault(require("./subscriptions/subscription.routes"));
const activity_log_routes_1 = __importDefault(require("./logs/activity-log.routes"));
const cart_routes_1 = __importDefault(require("./cart/cart.routes"));
const coupon_routes_1 = __importDefault(require("./coupons/coupon.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';
// ── Connect to MongoDB ──────────────────────────────
(0, db_1.default)();
// ── Security & Optimization Middlewares ─────────────
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
    message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);
// ── Middlewares ─────────────────────────────────────
app.use((0, cors_1.default)({
    origin: [clientUrl, 'http://localhost:4200', 'https://whatsstore.web.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// ── Health Check ────────────────────────────────────
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: '🟢 SiteFlow API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            business: '/api/business',
            products: '/api/products',
            orders: '/api/orders',
            reviews: '/api/reviews',
            analytics: '/api/analytics',
            cart: '/api/cart',
            coupons: '/api/coupons',
        },
    });
});
// ── API Routes ──────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/business', business_routes_1.default);
app.use('/api/products', products_routes_1.default);
app.use('/api/orders', orders_routes_1.default);
app.use('/api/reviews', reviews_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/superadmin', superadmin_routes_1.default);
app.use('/api/plans', plan_routes_1.default);
app.use('/api/subscriptions', subscription_routes_1.default);
app.use('/api/logs', activity_log_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/coupons', coupon_routes_1.default);
// ── 404 Handler ─────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// ── Global Error Handler ────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error'
    });
});
// ── Start Server ────────────────────────────────────
app.listen(port, () => {
    console.log(`\n🚀 Server running at http://localhost:${port}`);
    console.log(`📡 Client URL: ${clientUrl}\n`);
});
