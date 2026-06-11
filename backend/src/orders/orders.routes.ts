import { Router } from 'express';
import { getOrders, createOrder, updateOrderStatus, getPublicOrder } from './orders.controller';
import { protect } from '../config/jwt';
import { subscriptionGuard } from '../config/subscription-guard';

const router = Router();

// Public
router.post('/', createOrder);
router.get('/public/:id', getPublicOrder);

// Protected: business manages orders
router.use(protect);
router.use(subscriptionGuard);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;
