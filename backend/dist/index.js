"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
// Routes
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const business_routes_1 = __importDefault(require("./business/business.routes"));
const products_routes_1 = __importDefault(require("./products/products.routes"));
const orders_routes_1 = __importDefault(require("./orders/orders.routes"));
const reviews_routes_1 = __importDefault(require("./reviews/reviews.routes"));
const analytics_routes_1 = __importDefault(require("./analytics/analytics.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';
// ── Connect to MongoDB ──────────────────────────────
(0, db_1.default)();
// ── Middlewares ─────────────────────────────────────
app.use((0, cors_1.default)({
    origin: [clientUrl, 'http://localhost:4200'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
// ── 404 Handler ─────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// ── Start Server ────────────────────────────────────
app.listen(port, () => {
    console.log(`\n🚀 Server running at http://localhost:${port}`);
    console.log(`📡 Client URL: ${clientUrl}\n`);
});
