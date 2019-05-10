const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MixerStrategy = require('passport-mixer').Strategy;

const { mixerClientId, mixerClientSecret, mixerCallbackUrl } = require('../config/keys');

const Users = mongoose.model('User');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, (email, password, done) => {
  Users.findOne({ email })
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
  Users.findOne({ mixerId: profile.id }, (err, user) => done(err, user));
}));
