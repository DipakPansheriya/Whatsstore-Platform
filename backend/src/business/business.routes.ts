import { Router } from 'express';
import { getMyBusiness, createBusiness, updateBusiness, getPublicStore } from './business.controller';
import { protect } from '../config/jwt';
import { subscriptionGuard } from '../config/subscription-guard';

const router = Router();

// Public
router.get('/store/:slug', getPublicStore);

// Protected
router.use(protect);
router.use(subscriptionGuard);
router.get('/me', getMyBusiness);
router.post('/', createBusiness);
router.patch('/me', updateBusiness);

export default router;
