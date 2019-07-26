import express from 'express';
import localRoutes from './LocalRoutes';
import mixerRoutes from './MixerRoutes';

const router = express.Router();

router.use('/local', localRoutes);
router.use('/mixer', mixerRoutes);

export default router;
