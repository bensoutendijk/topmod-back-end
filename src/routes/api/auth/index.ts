import express from 'express';
import mongoose from 'mongoose';
import localRoutes from './LocalRoutes';
import mixerRoutes from './MixerRoutes';
import auth from '../../auth';
import { OAuthUserModel } from '../../../models/OAuthUser';

const router = express.Router();
const OAuthUser = mongoose.model('OAuthUser');

router.get('/users/:userid', auth.local.required, async (req, res) => {
  const { localAuth: { services} , params: { userid } } = req;

  if (!services.includes(userid)) {
    return res.status(400).send({ service: 'not authorized' })
  }

  const users = await OAuthUser.find({ _id: userid }) as OAuthUserModel[];

  const data = users.map(user => ({
    _id: user._id,
    data: user.user,
    provider: user.provider,
  }))

  res.send(data);
});

router.get('/users', auth.local.required, async (req, res) => {
  const { localAuth: {services} } = req;

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
