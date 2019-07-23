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
      throw new Error(JSON.stringify(data.error));
    }
  } catch (err) {
    console.log('Error: Could not refresh tokens');
    console.log(err.response.data);
  }
};

const mixer = {
  auth: async (req, res, next) => {
    const { payload: localUser } = req;
    const mixerUser = await MixerUser.findOne({ localUser: localUser._id });

    const accessTokenIntrospect = await tokenIntrospect(mixerUser.tokens.accessToken);

    if (accessTokenIntrospect.active) {
      res.mixerUser = mixerUser;
      next();
    } else {
      refreshTokens(mixerUser);
    }
  },
};

module.exports = mixer;
