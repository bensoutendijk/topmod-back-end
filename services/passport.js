const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MixerStrategy = require('passport-mixer').Strategy;

const { mixerClientId, mixerClientSecret, mixerCallbackUrl } = require('../config/keys');

const User = mongoose.model('User');
const MixerUser = mongoose.model('MixerUser');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, (email, password, done) => {
  User.findOne({ email })
    .then((user) => {
      if (!user || !user.validatePassword(password)) {
        return done(null, false, { errors: { 'email or password': 'is invalid' } });
      }

      return done(null, user);
    }).catch(done);
}));

passport.use(new MixerStrategy({
  clientID: mixerClientId,
  clientSecret: mixerClientSecret,
  callbackURL: mixerCallbackUrl,
}, (accessToken, refreshToken, profile, done) => {
  MixerUser.findById(profile.id)
    .then((user) => {
      if (user) {
        user.user.username = profile.username; /* eslint-disable-line no-param-reassign */
        user.tokens.accessToken = accessToken; /* eslint-disable-line no-param-reassign */
        user.tokens.refreshToken = refreshToken; /* eslint-disable-line no-param-reassign */

        user.save((err) => {
          if (err) {
            console.log(err);
            return done(err);
          }
          console.log(`${user.user.username}'s token's have been updated successfully.`);
          return done(null, user);
        });
      } else {
        const finalMixerUser = new MixerUser({
          _id: profile.id,
          user: {
            username: profile.username,
            userid: profile.id,
            channelid: profile._raw.channel.id, /* eslint-disable-line no-underscore-dangle */
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
          },
          provider: profile.provider,
        });

        finalMixerUser.save((err) => {
          if (err) {
            console.log(err);
            return done(err);
          }
          console.log(`${profile.username} has been saved to the database.`);
          return done(null, finalMixerUser);
        });
      }
      return done(null, user);
    });
}));
