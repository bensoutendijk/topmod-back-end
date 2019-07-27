import jwt from 'express-jwt';
import keys from '../config/keys';

const handleErrorMiddleware = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError' ) {
    return res.status(400).send({ user: 'not authorized' });
  }
}

const getHttpOnlyToken = (req) => {
  const { token } = req.cookies;
  if (token && token.split(' ')[0] === 'Token') {
    return token.split(' ')[1];
  }
  return null;
};
const getToken = (req) => {
  const { token2 } = req.cookies;
  if (token2 && token2.split(' ')[0] === 'Token') {
    return token2.split(' ')[1];
  }
  return null;
};

const auth = {
  local: {
    required: [
      jwt({
        secret: keys.jwtHttpOnlyKey,
        userProperty: 'localAuth',
        getToken: getHttpOnlyToken,
      }),
      jwt({
        secret: keys.jwtKey,
        userProperty: 'localAuth',
        getToken,
      }),
      handleErrorMiddleware
    ],
    optional: [
      jwt({
        secret: keys.jwtHttpOnlyKey,
        userProperty: 'localAuth',
        getToken: getHttpOnlyToken,
        credentialsRequired: false,
      }),
      jwt({
        secret: keys.jwtKey,
        userProperty: 'localAuth',
        getToken,
        credentialsRequired: false,
      }),
    ],
  }
};

export default auth;
