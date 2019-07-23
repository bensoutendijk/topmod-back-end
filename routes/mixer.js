const mongoose = require('mongoose');
const axios = require('axios');

const MixerUser = mongoose.model('MixerUser');

const keys = require('../config/keys');

const tokenIntrospect = async (token) => {
  const URI = 'https://mixer.com/api/v1/oauth/token/introspect';

  const { data } = await axios.post(URI, {
    token,
  });

  return data;
};

const refreshTokens = async (mixerUser) => {
  const URI = 'https://mixer.com/api/v1/oauth/token';

  try {
    const { data } = await axios.post(URI, {
      grant_type: 'refresh_token',
      refresh_token: mixerUser.tokens.refreshToken,
      client_id: keys.mixerClientId,
      client_secret: keys.mixerClientSecret,
    });
    if (data.error) {
      throw new Error('Mixer Token Error');
    }
    Object.assign(mixerUser, {
      tokens: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in,
      },
    });
    await mixerUser.save();
  } catch (err) {
    console.log(err);
  }
};

const mixer = {
  auth: async (req, res, next) => {
    const { payload: localProfile } = req;
    const mixerUser = await MixerUser.findOne({ localUser: localProfile._id });
    if (mixerUser) {
      const accessTokenIntrospect = await tokenIntrospect(mixerUser.tokens.accessToken);
      if (accessTokenIntrospect.active) {
        req.mixerUser = mixerUser;
        return next();
      }
    }
    return next();
  },
};

module.exports = mixer;
