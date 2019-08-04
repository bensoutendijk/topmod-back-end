import express from 'express';
import mongoose from 'mongoose';
import localRoutes from './LocalRoutes';
import mixerRoutes from './MixerRoutes';
import auth from '../../auth';
import { OAuthUserModel } from '../../../models/OAuthUser';

const router = express.Router();
const OAuthUser = mongoose.model('OAuthUser');

router.get('/users/:provider/:username', auth.local.required, async (req, res) => {
  const { localAuth: { services } , params: { provider, username } } = req;

  const users = await OAuthUser.find({ _id: { $in: services } }) as OAuthUserModel[];

  const data = users.filter(user => (
    user.provider.toLowerCase() === provider.toLowerCase() &&
    user.user.username.toLowerCase() === username.toLowerCase()
  ));

  res.send(data.map(user => ({
    _id: user._id,
    data: user.user,
    provider: user.provider,
  })));
});

router.get('/users', auth.local.required, async (req, res) => {
  const { localAuth: { services } } = req;

  const users = await OAuthUser.find({ _id: { $in: services } }) as OAuthUserModel[];

  const data = users.map(user => ({
    _id: user._id,
    data: user.user,
    provider: user.provider,
  }))

  res.send(data);
});

router.use('/local', localRoutes);
router.use('/mixer', mixerRoutes);

export default router;
