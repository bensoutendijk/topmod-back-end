import mongoose from 'mongoose';
import passport from 'passport';
import * as passportLocal from 'passport-local';
import * as passportMixer from 'passport-mixer';
const { mixerClientId, mixerClientSecret, mixerCallbackUrl } = require('../config/keys');

const User = mongoose.model('User');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(new passportLocal.Strategy({
  usernameField: 'email',
  passwordField: 'password',
}, (email, password, done) => {
  User.findOne({ email })
    .then((user) => {
      if (!user || !user.validatePassword(password)) {
        return done(null, false, { message: 'email or password is invalid' });
      }

      return done(null, user);
    }).catch(done);
}));

console.log(mixerClientId);

passport.use(new passportMixer.Strategy({
  clientID: mixerClientId,
  clientSecret: mixerClientSecret,
  callbackURL: mixerCallbackUrl,
}, (accessToken, refreshToken, profile, done) => {
  const mixerUser = {
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
  };

  return done(null, mixerUser);
}));
