import { Router } from 'express';
import { login, getMe, changePassword, logout } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

export const authRouter = Router();

// Public routes
authRouter.post('/login', login);
authRouter.post('/logout', logout);

// Protected routes (Requires Bearer JWT token)
authRouter.get('/me', authenticateToken, getMe);
authRouter.post('/change-password', authenticateToken, changePassword);
