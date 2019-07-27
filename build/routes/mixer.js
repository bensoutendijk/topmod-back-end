"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
const keys_1 = __importDefault(require("../config/keys"));
const MixerUser = mongoose_1.default.model('MixerUser');
const tokenIntrospect = (token) => __awaiter(this, void 0, void 0, function* () {
    const URI = 'https://mixer.com/api/v1/oauth/token/introspect';
    const { data } = yield axios_1.default.post(URI, {
        token,
    });
    return data;
});
const refreshTokens = (mixerUser) => __awaiter(this, void 0, void 0, function* () {
    const URI = 'https://mixer.com/api/v1/oauth/token';
    try {
        const { data } = yield axios_1.default.post(URI, {
            grant_type: 'refresh_token',
            refresh_token: mixerUser.tokens.refreshToken,
            client_id: keys_1.default.mixerClientId,
            client_secret: keys_1.default.mixerClientSecret,
        });
        if (data.error) {
            throw new Error('MixerUser Token Error');
        }
        Object.assign(mixerUser, {
            tokens: {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresAt: Date.now() + data.expires_in,
            },
        });
        try {
            yield mixerUser.save();
        }
        catch (err) {
            throw new Error('MixerUser Error');
        }
        return mixerUser.tokens;
    }
    catch (err) {
        throw new Error('MixerUser Token Error');
    }
});
const mixer = {
    auth: (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const { payload: localProfile } = req;
        const mixerUser = yield MixerUser.findOne({ localUser: localProfile._id });
        if (mixerUser) {
            const accessTokenIntrospect = yield tokenIntrospect(mixerUser.tokens.accessToken);
            if (accessTokenIntrospect.active) {
                req.mixerUser = mixerUser;
                return next();
            }
            refreshTokens(mixerUser);
            req.mixerUser = mixerUser;
        }
        return next();
    }),
};
exports.default = mixer;
//# sourceMappingURL=mixer.js.map