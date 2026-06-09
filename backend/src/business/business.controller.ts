import { Request, Response } from 'express';
import Business from './business.model';

/** GET /api/business/me */
export const getMyBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business profile not found' });
      return;
    }
    res.json({ success: true, business });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/business */
export const createBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const existing = await Business.findOne({ owner: userId });
    if (existing) {
      res.status(409).json({ success: false, message: 'Business profile already exists' });
      return;
    }
    const business = await Business.create({ ...req.body, owner: userId });
    res.status(201).json({ success: true, business });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PATCH /api/business/me */
export const updateBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const business = await Business.findOneAndUpdate(
      { owner: userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }
    res.json({ success: true, business });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/business/store/:slug — Public */
export const getPublicStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const business = await Business.findOne({ websiteSlug: req.params.slug, isPublished: true });
    if (!business) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }
    res.json({ success: true, business });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
