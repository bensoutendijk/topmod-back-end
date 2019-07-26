/* eslint-disable func-names */
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import keys from '../config/keys';

const { Schema } = mongoose;

const mixerUserSchema = new Schema({
  localUser: String,
  _id: String,
  user: {
    username: {
      type: String,
      required: true,
    },
    userid: {
      type: Number,
      required: true,
    },
    channelid: {
      type: Number,
      required: true,
    },
  },
  tokens: {
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Number,
      required: true,
    },
  },
  provider: String,
  createdAt: Date,
  updatedAt: Date,
});

mixerUserSchema.methods.generateHttpOnlyJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setTime(today.getTime() + 1000 * 60 * 30);

  return jwt.sign({
    _id: this._id,
    user: this.user, // eslint-disable-line no-underscore-dangle
    tokens: this.tokens,
    provider: this.provider,
    exp: (expirationDate.getTime() / 1000, 10),
  }, keys.jwtHttpOnlyKey);
};

mixerUserSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setTime(today.getTime() + 1000 * 60 * 30);

  return jwt.sign({
    _id: this._id,
    user: this.user, // eslint-disable-line no-underscore-dangle
    tokens: this.tokens,
    provider: this.provider,
    exp: (expirationDate.getTime() / 1000, 10),
  }, keys.jwtKey);
};

mongoose.model('MixerUser', mixerUserSchema);
