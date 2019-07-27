import mongoose, { Schema, Document } from 'mongoose';
import jwt from 'jsonwebtoken';
import keys from '../config/keys';
import { IOAuthUser, IMixerUser } from '../types';

export interface IMixerUserModel extends Document, IOAuthUser {
  user: IMixerUser,
  generateHttpOnlyJWT: () => string,
  generateJWT: () => string,
}

const mixerUserSchema = new Schema({
  localUser: String,
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

mixerUserSchema.methods.generateHttpOnlyJWT = () => {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setTime(today.getTime() + 1000 * 60 * 30);

  return jwt.sign({
    _id: this._id,
    user: this.user, // eslint-disable-line no-underscore-dangle
    tokens: this.tokens,
    provider: this.provider,
    exp: Math.floor(expirationDate.getTime() / 1000),
  }, keys.jwtHttpOnlyKey);
};

mixerUserSchema.methods.generateJWT = () => {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setTime(today.getTime() + 1000 * 60 * 30);

  return jwt.sign({
    _id: this._id,
    user: this.user, // eslint-disable-line no-underscore-dangle
    tokens: this.tokens,
    provider: this.provider,
    exp: Math.floor(expirationDate.getTime() / 1000),
  }, keys.jwtKey);
};

mongoose.model<IMixerUserModel>('MixerUser', mixerUserSchema);
