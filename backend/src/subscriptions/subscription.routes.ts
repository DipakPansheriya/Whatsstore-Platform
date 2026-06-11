import { Router } from 'express';
import { getSubscriptions, updateSubscriptionStatus, subscribe, getMySubscription, extendTrial } from './subscription.controller';
import { protect, restrictTo } from '../config/jwt';

const router = Router();

router.use(protect);

// Admin routes
router.get('/me', getMySubscription);
router.post('/subscribe', subscribe);

// SuperAdmin routes
router.use(restrictTo('SUPERADMIN'));
router.get('/', getSubscriptions);
router.put('/:id/status', updateSubscriptionStatus);
router.put('/:id/extend-trial', extendTrial);

export default router;
