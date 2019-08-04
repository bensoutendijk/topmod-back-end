import express, { Request } from 'express';
import mongoose from 'mongoose';
import streamsRoutes from './StreamsRoutes';
import auth from '../../auth';
import { OAuthUserModel } from '../../../models/OAuthUser';
import { ILocalUserModel } from '../../../models/LocalUser';

const router = express.Router();

const LocalUser = mongoose.model<ILocalUserModel>('LocalUser');
const OAuthUser = mongoose.model<OAuthUserModel>('OAuthUser');

router.get('/:provider/:username', auth.local.required, async (req, res) => {
  const { localAuth: { _id } , params: { provider, username } } = req;

  const { services } = await LocalUser.findById(_id) as ILocalUserModel;
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

router.get('/', auth.local.required, async (req, res) => {
  const { localAuth: { _id } } = req;

  const { services } = await LocalUser.findById(_id) as ILocalUserModel;
  const users = await OAuthUser.find({ _id: { $in: services } }) as OAuthUserModel[];

  const data = users.map(user => ({
    _id: user._id,
    data: user.user,
    provider: user.provider,
  }))

  res.send(data);
});

router.use('/:provider/:username/streams', (req: ProviderRequest, res, next) => {
  const { params: { provider, username } } = req
  req.provider = provider;
  req.username = username;
  next();
}, streamsRoutes);

interface ProviderRequest extends Request {
  provider: string,
  username: string,
}

export default router;
