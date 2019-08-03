import express from 'express';
import mongoose from 'mongoose';
import localRoutes from './LocalRoutes';
import mixerRoutes from './MixerRoutes';
import auth from '../../auth';

const router = express.Router();
const OAuthUser = mongoose.model('OAuthUser');

router.get('/', auth.local.required, async (req, res) => {
  const { localAuth } = req;
  const providerIds = localAuth.services.map(service => mongoose.Types.ObjectId(service));

  const providers = await OAuthUser.find({ _id: { $in: providerIds } });

  res.send(providers);
});

router.use('/local', localRoutes);
router.use('/mixer', mixerRoutes);

export default router;
