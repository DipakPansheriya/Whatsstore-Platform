import { Request, Response } from 'express';
import User from './auth.model';
import Business from '../business/business.model';
import { signToken } from '../config/jwt';

/** POST /api/auth/setup-superadmin (Hidden route for Postman) */
export const registerSuperAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email or phone already registered' });
      return;
    }

    const user = await User.create({ name, email, phone, passwordHash: password, role: 'SUPERADMIN', isVerified: true });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: 'SuperAdmin created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/auth/register */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, businessName, slug } = req.body;

    if (!name || !email || !phone || !password || !businessName || !slug) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email or phone already registered' });
      return;
    }

    const existingSlug = await Business.findOne({ websiteSlug: slug });
    if (existingSlug) {
      res.status(409).json({ success: false, message: 'Store URL slug is already taken' });
      return;
    }

    const user = await User.create({ name, email, phone, passwordHash: password, role: 'ADMIN' });

    // Automatically create business profile
    const business = await Business.create({
      owner: user.id,
      name: businessName,
      email,
      phone,
      whatsappNumber: phone,
      websiteSlug: slug,
    });

    // Automatically start 10-day free trial
    const { default: Subscription } = await import('../subscriptions/subscription.model');
    await Subscription.create({
      user: user.id,
      store: business.id,
      status: 'TRIAL_ACTIVE',
      trialStartDate: new Date(),
      // TEMPORARY: Set to 10 minutes for testing. Change back to 10 days (10 * 24 * 60 * 60 * 1000) after testing.
      trialEndDate: new Date(Date.now() + 10 * 60 * 1000)
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/auth/login */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/auth/me */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
