module.exports = {
  mongoURI: process.env.MONGO_URI,
  cookieKey: process.env.COOKIE_KEY,
  jwtHttpOnlyKey: process.env.JWT_SECRET_HTTP,
  jwtKey: process.env.JWT_SECRET,
  mixerClientId: process.env.MIXER_CLIENT_ID,
  mixerClientSecret: process.env.MIXER_CLIENT_SECRET,
  mixerCallbackUrl: 'https://bgoodtv.herokuapp.com/api/auth/mixer/callback',
};
