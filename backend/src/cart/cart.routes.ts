import { Router } from 'express';
import { getCart, addItem, updateItemQuantity, removeItem, clearCart } from './cart.controller';

const router = Router();

// Public cart endpoints
router.get('/:slug/:sessionId', getCart);
router.post('/:slug/:sessionId/items', addItem);
router.put('/:slug/:sessionId/items/:productId', updateItemQuantity);
router.delete('/:slug/:sessionId/items/:productId', removeItem);
router.delete('/:slug/:sessionId', clearCart);

export default router;
