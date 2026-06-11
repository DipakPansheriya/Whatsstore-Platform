import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';

// ── Connect to MongoDB ──────────────────────────────
connectDB();

// ── Middlewares ─────────────────────────────────────
app.use(cors({
  origin: [clientUrl, 'http://localhost:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ── 404 Handler ─────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Start Server ────────────────────────────────────
app.listen(port, () => {
  console.log(`\n🚀 Server running at http://localhost:${port}`);
  console.log(`📡 Client URL: ${clientUrl}\n`);
});
