import express from 'express';
import mixerRoutes from './MixerRoutes';

const router = express.Router();

router.use('/mixer', mixerRoutes);

export default router;
