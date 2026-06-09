import { Router } from 'express';
import { trackEvent, getAnalyticsDashboard } from './analytics.controller';
import { protect } from '../config/jwt';

const router = Router();

// Public event tracker
router.post('/track', trackEvent);

// Protected merchant analytics dashboard stats
router.get('/dashboard', protect, getAnalyticsDashboard);

export default router;
