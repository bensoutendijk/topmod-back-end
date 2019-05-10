/* eslint-disable func-names */
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, index: true },
  permissions: [{ type: String }],
  hash: String,
  salt: String,
});

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

userSchema.methods.validatePassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateHttpOnlyJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setTime(today.getTime() + 1000 * 60 * 30);

  return jwt.sign({
    email: this.email,
    _id: this._id, // eslint-disable-line no-underscore-dangle
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, keys.jwtHttpOnlyKey);
};

userSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setTime(today.getTime() + 1000 * 60 * 30);

  return jwt.sign({
    email: this.email,
    _id: this._id, // eslint-disable-line no-underscore-dangle
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, keys.jwtKey);
};

userSchema.methods.toJSON = function () {
  return {
    _id: this._id, // eslint-disable-line no-underscore-dangle
    email: this.email,
    permissions: this.permissions,
  };
};

mongoose.model('User', userSchema);
