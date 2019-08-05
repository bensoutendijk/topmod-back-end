import express from 'express';
import authRoutes from './auth';
import servicesRoutes from './services';
// import chatRoutes from './chat';
// import analyticsRoutes from './analytics'

const router = express.Router();

router.get('/hello', (req, res) => {
  const { body } = req;
  console.log(body);
  res.sendStatus(200);
})

router.use('/auth', authRoutes);
router.use('/services', servicesRoutes);
// router.use('/chat', chatRoutes);
// router.use('/analytics', analyticsRoutes);

export default router;
