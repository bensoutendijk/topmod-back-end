"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable func-names */
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const keys_1 = __importDefault(require("../config/keys"));
const userSchema = new mongoose_1.Schema({
    email: { type: String, index: true },
    permissions: [{ type: String }],
    services: [{ type: String }],
    hash: String,
    salt: String,
}, { timestamps: true });
userSchema.methods.setPassword = function setPassword(password) {
    this.salt = crypto_1.default.randomBytes(16).toString('hex');
    this.hash = crypto_1.default.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};
userSchema.methods.validatePassword = function validatePassword(password) {
    const hash = crypto_1.default.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};
userSchema.methods.generateHttpOnlyJWT = function generateHttpOnlyJWT() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setTime(today.getTime() + 1000 * 60 * 30);
    return jsonwebtoken_1.default.sign({
        email: this.email,
        _id: this._id,
        exp: Math.floor(expirationDate.getTime() / 1000),
    }, keys_1.default.jwtHttpOnlyKey);
};
userSchema.methods.generateJWT = function generateJWT() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setTime(today.getTime() + 1000 * 60 * 30);
    return jsonwebtoken_1.default.sign({
        email: this.email,
        _id: this._id,
        exp: Math.floor(expirationDate.getTime() / 1000),
    }, keys_1.default.jwtKey);
};
userSchema.methods.toJSON = function toJSON() {
    return {
        _id: this.id,
        email: this.email,
        permissions: this.permissions,
        services: this.services,
    };
};
mongoose_1.default.model('LocalUser', userSchema);
//# sourceMappingURL=LocalUser.js.map