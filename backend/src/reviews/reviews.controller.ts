import { Request, Response } from 'express';
import Review from './reviews.model';
import Product from '../products/products.model';
import Business from '../business/business.model';
import Notification from '../notifications/notification.model';

/** GET /api/reviews/product/:productId — Public product reviews list */
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ 
      product: req.params.productId,
      status: 'APPROVED'
    }).sort({ createdAt: -1 });
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
      comment,
      status: 'PENDING'
    });

    // Generate Notification for the business owner
    const product = await Product.findById(req.params.productId);
    if (product) {
      const business = await Business.findById(product.business);
      if (business) {
        await Notification.create({
          recipient: business.owner,
          type: 'REVIEW_NEW',
          title: 'New Review Pending',
          message: `You have a new ${rating}-star review for "${product.title}" from ${name}.`,
          relatedId: review._id.toString()
        });
      }
    }

    res.status(201).json({ success: true, review });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/reviews/admin — Admin get all reviews for their products */
export const getAdminReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }

    const products = await Product.find({ business: business._id }).select('_id');
    const productIds = products.map(p => p._id);

    const reviews = await Review.find({ product: { $in: productIds } })
      .populate('product', 'title images')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/reviews/admin/:id/status — Admin approve/reject review */
export const updateReviewStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    res.json({ success: true, review });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
