import { Request, Response, NextFunction } from 'express';
import Subscription from '../subscriptions/subscription.model';

/**
 * Subscription Guard: Protects routes against expired or suspended subscriptions.
 * Allows read operations (GET) but blocks write operations (POST, PUT, PATCH, DELETE) for inactive plans.
 */
export const subscriptionGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;

    // Bypass check for SUPERADMIN or if user context is missing
    if (!user || user.role === 'SUPERADMIN') {
      next();
      return;
    }

    // Bypass check for read operations (GET requests are allowed so they can view their dashboard, products, etc.)
    if (req.method === 'GET') {
      next();
      return;
    }

    // Find subscription for the merchant (role is ADMIN)
    const subscription = await Subscription.findOne({ user: user.userId });

    if (!subscription) {
      res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_EXPIRED',
        message: 'No subscription record found. Please select a plan.',
      });
      return;
    }

    // Perform lazy update check (copied from subscription controller)
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

    // Check if status is blocked
    const isAllowed = subscription.status === 'ACTIVE' || subscription.status === 'TRIAL_ACTIVE';
    if (!isAllowed) {
      res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_EXPIRED',
        message: 'Your subscription has expired or is suspended. Please upgrade or renew your plan to continue.',
      });
      return;
    }

    next();
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Subscription validation failed: ' + err.message });
  }
};
