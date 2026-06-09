import { Router } from 'express';
import { getOrders, createOrder, updateOrderStatus } from './orders.controller';
import { protect } from '../config/jwt';

const router = Router();

// Public: customer places order
router.post('/', createOrder);

// Protected: business manages orders
router.use(protect);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;
