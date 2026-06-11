import { Router } from 'express';
import { getDashboardStats, createAdmin, getUsers, getStores } from './superadmin.controller';
import { protect, restrictTo } from '../config/jwt';

const router = Router();

// All superadmin routes must be protected and restricted to SUPERADMIN role
router.use(protect);
router.use(restrictTo('SUPERADMIN'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/stores', getStores);
router.post('/admins', createAdmin);

export default router;
