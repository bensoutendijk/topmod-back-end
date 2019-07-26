import express from 'express';

const router = express.Router();

router.use('/mixer', require('./MixerRoutes'));

export default router;
