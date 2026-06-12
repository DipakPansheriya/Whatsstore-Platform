import { Router } from 'express';
import {
  getMarketplaceConfig,
  getMarketplaceHome,
  searchMarketplace,
  getSuperAdminAnalytics,
  updateMarketplaceConfig
} from './marketplace.controller';
import { protect, restrictTo } from '../config/jwt';

const router = Router();

// Public marketplace API routes
router.get('/config', getMarketplaceConfig);
router.get('/home',   getMarketplaceHome);
router.get('/search', searchMarketplace);

// SuperAdmin protected configurations
router.use(protect);
router.use(restrictTo('SUPERADMIN'));

router.get('/admin/analytics', getSuperAdminAnalytics);
router.put('/admin/config',    updateMarketplaceConfig);

export default router;
