import { Router } from 'express';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon, getPublicCoupons, getProductPublicCoupons } from './coupon.controller';
import { protect } from '../config/jwt';
import { subscriptionGuard } from '../config/subscription-guard';

const router = Router();

// Public routes for coupons
router.get('/public/:slug/validate/:code', validateCoupon);
router.get('/public-store/:slug', getPublicCoupons);
router.get('/public-store/product/:productId', getProductPublicCoupons);

// Protected merchant dashboard routes
router.use(protect);
router.use(subscriptionGuard);

router.get('/', getCoupons);
router.post('/', createCoupon);
router.patch('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;
