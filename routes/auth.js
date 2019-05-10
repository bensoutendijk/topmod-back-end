const jwt = require('express-jwt');
const keys = require('../config/keys');

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
  required: [
    jwt({
      secret: keys.jwtHttpOnlyKey,
      userProperty: 'payload',
      getToken: getHttpOnlyToken,
    }),
    jwt({
      secret: keys.jwtKey,
      userProperty: 'payload',
      getToken,
    }),
  ],
  optional: [
    jwt({
      secret: keys.jwtHttpOnlyKey,
      userProperty: 'payload',
      getToken: getHttpOnlyToken,
      credentialsRequired: false,
    }),
    jwt({
      secret: keys.jwtKey,
      userProperty: 'payload',
      getToken,
      credentialsRequired: false,
    }),
  ],
};

module.exports = auth;
