import { Router } from 'express';
import { getProductReviews, createProductReview } from './reviews.controller';

const router = Router();

// Public routes for product reviews
router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', createProductReview);

export default router;
