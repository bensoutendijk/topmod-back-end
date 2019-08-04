import axios from 'axios';
import keys from '../config/keys';

const tokenIntrospect = async (token, URI) => {

  const { data } = await axios.post(URI, {
    token,
  });

  return data;
};

const refreshTokens = async (user, URI) => {
  try {
    const { data } = await axios.post(URI, {
      grant_type: 'refresh_token',
      refresh_token: user.tokens.refreshToken,
      client_id: keys.mixerClientId,
      client_secret: keys.mixerClientSecret,
    });
    if (data.error) {
      throw new Error('Mixer Token Error');
    }
    Object.assign(user, {
      tokens: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in,
      },
    });
    try {
      await user.save();
    } catch (err) {
      throw new Error('Mixer Error');
    }
    return user.tokens;
  } catch (err) {
    throw new Error('Mixer Token Error');
  }
};

const mixerAuth = async (req, res, next) => {
  const { localAuth: { _id }, service } = req;

  let introspectURI;
  let refreshURI;

  switch (service.provider) {
    case 'mixer':
      introspectURI = 'https://mixer.com/api/v1/oauth/token/introspect';
      refreshURI = 'https://mixer.com/api/v1/oauth/token';
      break;
    default:
      return next();
  }

  if (service) {
    const accessTokenIntrospect = await tokenIntrospect(service.tokens.accessToken, introspectURI);
    if (accessTokenIntrospect.active) {
      req.service = service;
      return next();
    }
    await refreshTokens(service, refreshURI);
    req.service = service;
  }
  return next();
};

export default mixerAuth;
