/* eslint-disable func-names */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
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
});

const User = mongoose.model('Users', userSchema);

module.exports = User;
