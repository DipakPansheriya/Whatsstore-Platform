import { Request, Response } from 'express';
import Order from './orders.model';
import Business from '../business/business.model';

/** GET /api/orders */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const business = await Business.findOne({ owner: userId });
    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }
    const orders = await Order.find({ business: business._id })
      .populate('items.product', 'title price')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/orders — Public: customer places an order */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PATCH /api/orders/:id/status */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
