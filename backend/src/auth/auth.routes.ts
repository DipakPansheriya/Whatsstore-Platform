import { Router } from 'express';
import { register, login, getMe, registerSuperAdmin } from './auth.controller';
import { protect } from '../config/jwt';

const router = Router();

router.post('/setup-superadmin', registerSuperAdmin);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
