import { Router } from 'express';
import { getPlans, getAllPlans, createPlan, updatePlan, deletePlan } from './plan.controller';
import { protect, restrictTo } from '../config/jwt';

const router = Router();

// Public route for landing page
router.get('/', getPlans);

// Protected routes for SuperAdmin
router.use(protect);
router.use(restrictTo('SUPERADMIN'));

router.get('/all', getAllPlans);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

export default router;
