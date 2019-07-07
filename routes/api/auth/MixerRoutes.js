const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../../auth');
const mixerChat = require('../../mixerChat');

const MixerUser = mongoose.model('MixerUser');

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
      mixerUser.user.username = profile.user.username;
      mixerUser.tokens.accessToken = profile.tokens.accessToken;
      mixerUser.tokens.refreshToken = profile.tokens.refreshToken;

      try {
        await mixerUser.save();
      } catch (err) {
        console.log(err);
        return res.header('MongooseError', err.message);
      }
      console.log(`${mixerUser.user.username}'s token's have been updated successfully.`);
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

      const client = mixerChat.getMixerClient(finalMixerUser);
      try {
        await mixerChat.refresh(client, finalMixerUser);
        await mixerChat.connect(client, finalMixerUser);
      } catch (err) {
        console.log(err);
      }
    }

    // Successful authentication, redirect home.
    return res.redirect('/');
  });

module.exports = router;
