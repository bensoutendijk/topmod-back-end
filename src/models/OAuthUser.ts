import mongoose, { Schema, Document } from 'mongoose';
import { IOAuthUser, IMixerUser } from '../types';

export interface OAuthUserModel extends Document, IOAuthUser {
  user: IMixerUser,
}

const oauthUserSchema = new Schema({
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
}, { timestamps: true });

mongoose.model<OAuthUserModel>('OAuthUser', oauthUserSchema);
