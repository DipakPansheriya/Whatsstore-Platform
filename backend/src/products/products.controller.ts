import { Request, Response } from 'express';
import Product from './products.model';
import Business from '../business/business.model';

/** GET /api/products — Get all products for authenticated business */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }
    const products = await Product.find({ business: business._id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/products/public/:businessId — Public product list */
export const getPublicProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({
      business: req.params.businessId,
      isAvailable: true,
    }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/products/public/product/:id — Public product details */
export const getPublicProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isAvailable) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/products */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }
    const product = await Product.create({ ...req.body, business: business._id });
    res.status(201).json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PATCH /api/products/:id */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** DELETE /api/products/:id */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
