import { Request, Response } from 'express';
import Plan from './plan.model';

/** GET /api/plans (Public) */
export const getPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
    res.json({ success: true, plans });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/plans/all (SuperAdmin) */
export const getAllPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json({ success: true, plans });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/plans (SuperAdmin) */
export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/plans/:id (SuperAdmin) */
export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }
    res.json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** DELETE /api/plans/:id (SuperAdmin) */
export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
