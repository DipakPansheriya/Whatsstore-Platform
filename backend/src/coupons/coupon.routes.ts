import { Router } from 'express';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from './coupon.controller';
import { protect } from '../config/jwt';
import { subscriptionGuard } from '../config/subscription-guard';

const router = Router();

// Public route to validate coupon during checkout
router.get('/public/:slug/validate/:code', validateCoupon);

// Protected merchant dashboard routes
router.use(protect);
router.use(subscriptionGuard);

router.get('/', getCoupons);
router.post('/', createCoupon);
router.patch('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;
