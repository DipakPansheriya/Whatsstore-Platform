import { Router } from 'express';
import { getProductReviews, createProductReview, getAdminReviews, updateReviewStatus } from './reviews.controller';
import { protect } from '../config/jwt';

const router = Router();

// Public routes for product reviews
router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', createProductReview);

// Admin routes
router.get('/admin', protect, getAdminReviews);
router.put('/admin/:id/status', protect, updateReviewStatus);

export default router;
