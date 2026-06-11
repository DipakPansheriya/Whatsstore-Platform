import { Request, Response } from 'express';
import User from '../auth/auth.model';
import Business from '../business/business.model';
import Subscription from '../subscriptions/subscription.model';
import Plan from '../plans/plan.model';

/** GET /api/superadmin/dashboard-stats */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStores = await Business.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'ACTIVE' });
    
    // Calculate simple MRR (Monthly Recurring Revenue) from active subscriptions
    const activeSubsWithPlans = await Subscription.find({ status: 'ACTIVE' }).populate<{ plan: any }>('plan');
    const monthlyRevenue = activeSubsWithPlans.reduce((acc, sub) => {
      const price = sub.plan?.price || 0;
      const isYearly = sub.plan?.billingCycle === 'yearly';
      return acc + (isYearly ? price / 12 : price);
    }, 0);

    // New signups in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newSignups = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        activeSubscriptions,
        monthlyRevenue: Math.round(monthlyRevenue),
        newSignups
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/superadmin/users */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/superadmin/stores */
export const getStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const stores = await Business.find().populate('owner', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, stores });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/superadmin/admins */
export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, businessName, slug } = req.body;

    if (!name || !email || !phone || !password || !businessName || !slug) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email or phone already registered' });
      return;
    }

    const existingSlug = await Business.findOne({ websiteSlug: slug });
    if (existingSlug) {
      res.status(409).json({ success: false, message: 'Store URL slug is already taken' });
      return;
    }

    const user = await User.create({ name, email, phone, passwordHash: password, role: 'ADMIN', isVerified: true });

    // Automatically create business profile
    await Business.create({
      owner: user.id,
      name: businessName,
      email,
      phone,
      whatsappNumber: phone,
      websiteSlug: slug,
    });

    res.status(201).json({
      success: true,
      message: 'Admin and store created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
