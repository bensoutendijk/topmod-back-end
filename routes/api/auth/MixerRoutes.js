const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../../auth');

const MixerUser = mongoose.model('MixerUser');

router.get('/login',
  passport.authenticate('mixer', {
    scope: [
      'chat:connect',
      'chat:chat',
      'chat:change_ban',
      'chat:change_role',
      'chat:timeout',
      'chat:remove_message',
      'chat:purge',
      'chat:view_deleted',
      'chat:bypass_links',
      'chat:bypass_slowchat',
      'channel:analytics:self',
      'channel:details:self',
      'user:details:self',
      'user:analytics:self',
      'channel:update:self',
    ],
  }));

router.get('/callback',
  passport.authenticate('mixer', { failureRedirect: '/login' }), async (req, res) => {
    const { user: profile } = req;
    console.log(profile);

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
      res.cookie('token', `Token ${mixerUser.generateHttpOnlyJWT()}`, {
        expires: new Date(Date.now() + 1000 * 60 * 30),
        httpOnly: true,
      });
      res.cookie('token2', `Token ${mixerUser.generateJWT()}`, {
        expires: new Date(Date.now() + 1000 * 60 * 30),
      });
    } else {
      const finalMixerUser = new MixerUser({
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
      } catch (err) {
        console.log(err);
        return res.header('MongooseError', err.message);
      }
      console.log(`${profile.user.username} has been saved to the database.`);
      res.cookie('token', `Token ${finalMixerUser.generateHttpOnlyJWT()}`, {
        expires: new Date(Date.now() + 1000 * 60 * 30),
        httpOnly: true,
      });
      res.cookie('token2', `Token ${finalMixerUser.generateJWT()}`, {
        expires: new Date(Date.now() + 1000 * 60 * 30),
      });
    }

    // Successful authentication, redirect home.
    return res.redirect('/');
  });


router.get('/current', auth.required, (req, res) => {
  res.send(req.payload.user);
});

module.exports = router;
