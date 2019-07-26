import express from 'express';
import apiRoutes from './api';

console.log(apiRoutes);

const router = express.Router();

router.use('/api', apiRoutes);

export default router;
