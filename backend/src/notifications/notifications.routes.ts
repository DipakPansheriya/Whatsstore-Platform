import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from './notifications.controller';
import { protect } from '../config/jwt';

const router = Router();

router.use(protect); // All routes require authentication

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;
