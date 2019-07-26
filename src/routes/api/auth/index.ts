import express from 'express';

const router = express.Router();

router.use('/local', require('./LocalRoutes'));
router.use('/mixer', require('./MixerRoutes'));

export default router;
