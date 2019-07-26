import express from 'express';
import authRoutes from './auth';
import chatRoutes from './chat';
import analyticsRoutes from './analytics'

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
