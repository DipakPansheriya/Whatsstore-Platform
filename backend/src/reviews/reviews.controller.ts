import { Request, Response } from 'express';
import Review from './reviews.model';

/** GET /api/reviews/product/:productId — Public product reviews list */
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/reviews/product/:productId — Public create review */
export const createProductReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, rating, comment } = req.body;
    if (!name || !rating || !comment) {
      res.status(400).json({ success: false, message: 'Name, rating, and comment are required' });
      return;
    }
    const review = await Review.create({
      product: req.params.productId,
      name,
      rating,
      comment
    });
    res.status(201).json({ success: true, review });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
