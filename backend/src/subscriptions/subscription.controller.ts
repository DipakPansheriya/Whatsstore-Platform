import { Request, Response } from 'express';
import Subscription from './subscription.model';
import ActivityLog from '../logs/activity-log.model';
import Business from '../business/business.model';
import Plan from '../plans/plan.model';

/** GET /api/subscriptions (SuperAdmin) */
export const getSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const subscriptions = await Subscription.find()
      .populate('user', 'name email')
      .populate('store', 'name websiteSlug')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });
    res.json({ success: true, subscriptions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/subscriptions/:id/status (SuperAdmin) */
export const updateSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!subscription) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }

    // Log the manual update
    await ActivityLog.create({
      user: (req as any).user?.userId,
      action: `Subscription status changed to ${status}`,
      module: 'Subscriptions',
      ipAddress: req.ip || 'unknown'
    });

    res.json({ success: true, subscription });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
/** PUT /api/subscriptions/:id/extend-trial (SuperAdmin) */
export const extendTrial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }

    // Add days to trialEndDate
    const newEndDate = new Date(subscription.trialEndDate.getTime() + (days || 7) * 24 * 60 * 60 * 1000);
    subscription.trialEndDate = newEndDate;
    if (subscription.status === 'TRIAL_EXPIRED') {
      subscription.status = 'TRIAL_ACTIVE';
    }
    
    await subscription.save();

    await ActivityLog.create({
      user: (req as any).user?.userId,
      action: `Trial extended by ${days || 7} days`,
      module: 'Subscriptions',
      ipAddress: req.ip || 'unknown'
    });

    res.json({ success: true, subscription });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
/** POST /api/subscriptions/subscribe (Admin) */
export const subscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.body;
    const userId = (req as any).user?.userId;

    if (!planId) {
      res.status(400).json({ success: false, message: 'Plan ID is required' });
      return;
    }

    const business = await Business.findOne({ owner: userId });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found for this user' });
      return;
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    let subscription = await Subscription.findOne({ user: userId });
    
    const startDate = new Date();
    const expiryDate = new Date();
    if (plan.billingCycle === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    if (subscription) {
      subscription.plan = planId;
      subscription.status = 'ACTIVE';
      subscription.startDate = startDate;
      subscription.expiryDate = expiryDate;
      await subscription.save();
    } else {
      subscription = await Subscription.create({
        user: userId,
        store: business._id,
        plan: planId,
        status: 'ACTIVE',
        trialStartDate: new Date(),
        trialEndDate: new Date(), // Already paid, so trial technically ends
        startDate,
        expiryDate
      });
    }

    // Mock payment recording
    const { default: PaymentHistory } = await import('../payments/payment-history.model');
    await PaymentHistory.create({
      user: userId,
      store: business._id,
      plan: planId,
      amount: plan.price,
      status: 'SUCCESS',
      paymentDate: new Date(),
      referenceId: 'MOCK_' + Math.random().toString(36).substring(2, 10).toUpperCase()
    });

    // Log the action
    await ActivityLog.create({
      user: userId,
      action: `User upgraded to plan ${plan.name} (Activated)`,
      module: 'Subscriptions',
      ipAddress: req.ip || 'unknown'
    });

    res.status(201).json({ success: true, subscription });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/subscriptions/me (Admin) */
export const getMySubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const subscription = await Subscription.findOne({ user: userId })
      .populate('plan', 'name price');
      
    if (!subscription) {
      res.status(404).json({ success: false, message: 'Subscription not found', status: 'NONE' });
      return;
    }
    
    // Lazy status updates
    const now = new Date();
    let updated = false;

    if (subscription.status === 'TRIAL_ACTIVE' && subscription.trialEndDate < now) {
      subscription.status = 'TRIAL_EXPIRED';
      updated = true;
    } else if (subscription.status === 'ACTIVE' && subscription.expiryDate && subscription.expiryDate < now) {
      subscription.status = 'EXPIRED';
      updated = true;
    }

    if (updated) {
      await subscription.save();
    }
    
    res.json({ success: true, subscription });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
