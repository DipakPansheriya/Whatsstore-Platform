import { Router } from 'express';
import { getProducts, getPublicProducts, getPublicProduct, createProduct, updateProduct, deleteProduct } from './products.controller';
import { protect } from '../config/jwt';

const router = Router();

// Public
router.get('/public/:businessId', getPublicProducts);
router.get('/public/product/:id', getPublicProduct);

// Protected
router.use(protect);
router.get('/', getProducts);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
