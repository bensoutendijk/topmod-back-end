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
const mongoose_1 = __importStar(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const keys_1 = __importDefault(require("../config/keys"));
const mixerUserSchema = new mongoose_1.Schema({
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
    return jsonwebtoken_1.default.sign({
        _id: this._id,
        user: this.user,
        tokens: this.tokens,
        provider: this.provider,
        exp: Math.floor(expirationDate.getTime() / 1000),
    }, keys_1.default.jwtHttpOnlyKey);
};
mixerUserSchema.methods.generateJWT = () => {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setTime(today.getTime() + 1000 * 60 * 30);
    return jsonwebtoken_1.default.sign({
        _id: this._id,
        user: this.user,
        tokens: this.tokens,
        provider: this.provider,
        exp: Math.floor(expirationDate.getTime() / 1000),
    }, keys_1.default.jwtKey);
};
mongoose_1.default.model('MixerUser', mixerUserSchema);
//# sourceMappingURL=MixerUser.js.map