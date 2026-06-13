import { Request, Response } from 'express';
import Notification from './notification.model';

/** GET /api/notifications */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/notifications/:id/read */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.json({ success: true, notification });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/notifications/read-all */
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
