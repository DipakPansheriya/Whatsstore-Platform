import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';

// Routes
import authRoutes from './auth/auth.routes';
import businessRoutes from './business/business.routes';
import productRoutes from './products/products.routes';
import orderRoutes from './orders/orders.routes';
import reviewRoutes from './reviews/reviews.routes';
import analyticsRoutes from './analytics/analytics.routes';
import superAdminRoutes from './superadmin/superadmin.routes';
import planRoutes from './plans/plan.routes';
import subscriptionRoutes from './subscriptions/subscription.routes';
import logRoutes from './logs/activity-log.routes';
import cartRoutes from './cart/cart.routes';
import couponRoutes from './coupons/coupon.routes';
import marketplaceRoutes from './marketplace/marketplace.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';

// ── Connect to MongoDB ──────────────────────────────
connectDB();

// ── Security & Optimization Middlewares ─────────────
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// ── Middlewares ─────────────────────────────────────
app.use(cors({
  origin: [clientUrl, 'http://localhost:4200', 'https://whatsstore.web.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health Check ────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: '🟢 SiteFlow API is running',
    version: '1.0.0',
    endpoints: {
      auth:      '/api/auth',
      business:  '/api/business',
      products:  '/api/products',
      orders:    '/api/orders',
      reviews:   '/api/reviews',
      analytics: '/api/analytics',
      cart:      '/api/cart',
      coupons:   '/api/coupons',
    },
  });
});

// ── API Routes ──────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/business',  businessRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/reviews',   reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// ── 404 Handler ─────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
