import mongoose from 'mongoose';
import passport from 'passport';
import express from 'express';

import auth from '../../auth';
import mixer from '../../mixer';

const router = express.Router();
const User = mongoose.model('User');
const MixerUser = mongoose.model('MixerUser');

const createMixerUser = async (mixerProfile, localUser) => {
  const finalMixerUser = new MixerUser({
    localUser: localUser._id,
    _id: mixerProfile._id,
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
    createdAt: Date.now(),
    updatedAt: Date.now(),
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

    const mixerUser = await MixerUser.findById(mixerProfile._id);
    const localUser = await User.findById(localProfile._id);

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
