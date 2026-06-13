import { Request, Response } from 'express';
import Coupon from './coupon.model';
import Business from '../business/business.model';
import Order from '../orders/orders.model';
import Product from '../products/products.model';

/** GET /api/coupons (Admin only) */
export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }

    let coupons = await Coupon.find({ business: business._id }).sort({ createdAt: -1 });
    
    // Auto-expire past due coupons lazily
    const now = new Date();
    let updated = false;
    for (let c of coupons) {
      if (c.expiryDate && new Date(c.expiryDate) < now && c.isActive) {
        c.isActive = false;
        await c.save();
        updated = true;
      }
    }

    // Refetch if any were updated
    if (updated) {
      coupons = await Coupon.find({ business: business._id }).sort({ createdAt: -1 });
    }

    res.json({ success: true, coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/coupons (Admin only) */
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }

    const { code, discountType, discountValue, startDate, expiryDate, isActive, visibility, displayOnStore } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      res.status(400).json({ success: false, message: 'Code, discount type, and discount value are required' });
      return;
    }

    // Check if code already exists for this business
    const existing = await Coupon.findOne({ business: business._id, code: code.toUpperCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Coupon code already exists for your store' });
      return;
    }

    const coupon = await Coupon.create({
      business: business._id,
      code: code.toUpperCase(),
      discountType,
      discountValue,
      startDate: startDate ? new Date(startDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      isActive: isActive !== undefined ? isActive : true,
      visibility: visibility || 'PRIVATE',
      displayOnStore: displayOnStore !== undefined ? displayOnStore : false
    });

    res.status(201).json({ success: true, coupon });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PATCH /api/coupons/:id (Admin only) */
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountValue, startDate, expiryDate, isActive, visibility, displayOnStore } = req.body;
    const updateData: any = {};
    if (code) updateData.code = code.toUpperCase();
    if (discountType) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = discountValue;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (displayOnStore !== undefined) updateData.displayOnStore = displayOnStore;

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }

    res.json({ success: true, coupon });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** DELETE /api/coupons/:id (Admin only) */
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/coupons/public/:slug/validate/:code (Public endpoint for checkout page) */
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug, code } = req.params;

    const business = await Business.findOne({ websiteSlug: slug });
    if (!business) {
      res.status(404).json({ success: false, message: 'Storefront not found' });
      return;
    }

    const coupon = await Coupon.findOne({ business: business._id, code: code.toUpperCase() });
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid coupon code' });
      return;
    }

    const now = new Date();
    
    // Auto-expire if past due
    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
      coupon.isActive = false;
      await coupon.save();
      res.status(400).json({ success: false, message: 'This coupon has expired' });
      return;
    }

    if (!coupon.isActive) {
      res.status(400).json({ success: false, message: 'This coupon is no longer active' });
      return;
    }

    if (coupon.startDate && new Date(coupon.startDate) > now) {
      res.status(400).json({ success: false, message: 'This coupon is not active yet' });
      return;
    }

    const phone = req.query.phone as string;
    if (phone) {
      const used = await Order.findOne({
        business: business._id,
        customerPhone: phone,
        couponCode: code.toUpperCase(),
        status: { $ne: 'CANCELLED' }
      });
      if (used) {
        res.status(400).json({ success: false, message: 'You have already used this coupon code.' });
        return;
      }
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/coupons/public-store/:slug (Public endpoint for storefront page) */
export const getPublicCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const business = await Business.findOne({ websiteSlug: slug });
    if (!business) {
      res.status(404).json({ success: false, message: 'Storefront not found' });
      return;
    }

    const now = new Date();
    const coupons = await Coupon.find({
      business: business._id,
      visibility: 'PUBLIC',
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gt: now } }
      ],
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: now } }
          ]
        }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/coupons/public-store/product/:productId (Public endpoint for product page) */
export const getProductPublicCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const now = new Date();
    const coupons = await Coupon.find({
      business: product.business,
      visibility: 'PUBLIC',
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gt: now } }
      ],
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: now } }
          ]
        }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
