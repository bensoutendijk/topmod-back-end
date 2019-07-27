import mongoose from 'mongoose';
import passport from 'passport';
import express from 'express';

import auth from '../../auth';
import mixer from '../../mixer';
import { IMixerUserModel } from '../../../models/MixerUser';
import { ILocalUserModel } from '../../../models/LocalUser';

const router = express.Router();
const LocalUser = mongoose.model('LocalUser');
const MixerUser = mongoose.model<IMixerUserModel>('MixerUser');

const createMixerUser = async (mixerProfile: IMixerUserModel, localUser: ILocalUserModel) => {
  const finalMixerUser = new MixerUser({
    localUser: localUser._id,
    user: {
      username: mixerProfile.user.username,
      userid: mixerProfile._id,
      channelid: mixerProfile.user.channelid,
    },
    tokens: {
      accessToken: mixerProfile.tokens.accessToken,
      refreshToken: mixerProfile.tokens.refreshToken,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365,
    },
    provider: mixerProfile.provider,
  });

  localUser.services.push('mixer');

  try {
    await finalMixerUser.save();
    await localUser.save();
  } catch (err) {
    console.log(err);
  }
};

const updateMixerUser = async (mixerProfile, mixerUser) => {
  Object.assign(mixerUser, mixerProfile);

  try {
    await mixerUser.save();
  } catch (err) {
    console.log(err);
  }
};

router.get('/login', auth.required, passport.authenticate('mixer', {
  scope: [
    'chat:connect',
    'chat:view_deleted',
    'channel:analytics:self',
    'channel:details:self',
    'user:details:self',
    'user:analytics:self',
  ],
}));

router.get('/callback',
  auth.required,
  passport.authenticate('mixer', { failureRedirect: '/login' }), async (req, res) => {
    const { user: mixerProfile } = req;
    const { payload: localProfile } = req;

    const mixerUser = await MixerUser.findOne({ user: { userid: mixerProfile._id } }) as IMixerUserModel;
    const localUser = await LocalUser.findById(localProfile._id) as ILocalUserModel;

    if (mixerUser) {
      updateMixerUser(mixerProfile, mixerUser);
    } else {
      createMixerUser(mixerProfile, localUser);
    }

    // Successful authentication, redirect home.
    return res.redirect('/');
  });

router.get('/current', auth.required, mixer.auth, async (req, res) => {
  const { mixerUser } = req;
  if (mixerUser) {
    return res.send(mixerUser.user);
  }
  return res.sendStatus(400);
});

export default router;
