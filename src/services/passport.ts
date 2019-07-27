import mongoose from 'mongoose';
import passport from 'passport';
import * as passportLocal from 'passport-local';
import * as passportMixer from 'passport-mixer';
import keys from '../config/keys';
import { ILocalUserModel } from '../models/LocalUser';

const { mixerClientId, mixerClientSecret, mixerCallbackUrl } = keys;

const LocalUser = mongoose.model('LocalUser');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  LocalUser.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(new passportLocal.Strategy({
  usernameField: 'email',
  passwordField: 'password',
}, (email, password, done) => {
  LocalUser.findOne({ email })
    .then((user: ILocalUserModel) => {
      if (!user || !user.validatePassword(password)) {
        return done(null, false, { message: 'email or password is invalid' });
      }

      return done(null, user);
    }).catch(done);
}));

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
