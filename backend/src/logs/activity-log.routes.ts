import { Router } from 'express';
import { getLogs } from './activity-log.controller';
import { protect, restrictTo } from '../config/jwt';

const router = Router();

router.use(protect);
router.use(restrictTo('SUPERADMIN'));

router.get('/', getLogs);

export default router;
