const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();

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
  passport.authenticate('mixer', { failureRedirect: '/login' }), (req, res) => {
    const { user: profile } = req;
    console.log(profile);

    MixerUser.findById(profile._id)
      .then((mixerUser) => {
        if (mixerUser) {
          mixerUser.user.username = profile.user.username; /* eslint-disable-line no-param-reassign */
          mixerUser.tokens.accessToken = profile.tokens.accessToken; /* eslint-disable-line no-param-reassign */
          mixerUser.tokens.refreshToken = profile.tokens.refreshToken; /* eslint-disable-line no-param-reassign */

          mixerUser.save((err) => {
            if (err) {
              console.log(err);
              return res.setHeader('MongoError', JSON.stringify(err));
            }
            console.log(`${mixerUser.user.username}'s token's have been updated successfully.`);
            return true;
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
          });

          finalMixerUser.save((err) => {
            if (err) {
              console.log(err);
              return res.setHeader('MongoError', JSON.stringify(err));
            }
            console.log(`${profile.user.username} has been saved to the database.`);
            return true;
          });
        }
      });
    // Successful authentication, redirect home.
    return res.redirect('/');
  });


router.get('/current', (req, res) => {
  res.send({
    _id: 123,
  });
});

module.exports = router;
