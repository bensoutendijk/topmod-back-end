const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();

const auth = require('../../auth');
const mixer = require('../../mixer');

const MixerUser = mongoose.model('MixerUser');

const updateMixerUser = async (mixerUser, profile) => {
  Object.assign(mixerUser, profile);

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
    const { user: profile } = req;
    const { payload: localUser } = req;

    const mixerUser = await MixerUser.findById(profile._id);

    if (mixerUser) {
      updateMixerUser(mixerUser, profile);
    } else {
      const finalMixerUser = new MixerUser({
        localUser: localUser._id,
        _id: profile._id,
        user: {
          username: profile.user.username,
          userid: profile._id,
          channelid: profile.user.channelid, /* eslint-disable-line no-underscore-dangle */
        },
        tokens: {
          accessToken: profile.tokens.accessToken,
          refreshToken: profile.tokens.refreshToken,
          expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
        },
        provider: profile.provider,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      try {
        await finalMixerUser.save();
        console.log(`${profile.user.username} has been saved to the database.`);
      } catch (err) {
        console.log(err);
        return res.header('MongooseError', err.message);
      }
    }

    // Successful authentication, redirect home.
    return res.redirect('/');
  });

router.get('/current', auth.required, mixer.auth, async (req, res) => {
  const { mixerUser } = req;
  res.send(mixerUser.user);
});

module.exports = router;
