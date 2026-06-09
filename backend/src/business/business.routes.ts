import { Router } from 'express';
import { getMyBusiness, createBusiness, updateBusiness, getPublicStore } from './business.controller';
import { protect } from '../config/jwt';

const router = Router();

// Public
router.get('/store/:slug', getPublicStore);

// Protected
router.use(protect);
router.get('/me', getMyBusiness);
router.post('/', createBusiness);
router.patch('/me', updateBusiness);

export default router;
