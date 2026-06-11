import { Request, Response } from 'express';
import ActivityLog from './activity-log.model';

/** GET /api/logs (SuperAdmin) */
export const getLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .limit(200); // limit to recent 200 logs to prevent massive payload
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
