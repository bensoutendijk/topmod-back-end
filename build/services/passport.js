"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const passport_1 = __importDefault(require("passport"));
const passportLocal = __importStar(require("passport-local"));
const passportMixer = __importStar(require("passport-mixer"));
const keys_1 = __importDefault(require("../config/keys"));
const { mixerClientId, mixerClientSecret, mixerCallbackUrl } = keys_1.default;
const LocalUser = mongoose_1.default.model('LocalUser');
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((id, done) => {
    LocalUser.findById(id, (err, user) => {
        done(err, user);
    });
});
passport_1.default.use(new passportLocal.Strategy({
    usernameField: 'email',
    passwordField: 'password',
}, (email, password, done) => {
    LocalUser.findOne({ email })
        .then((user) => {
        if (!user || !user.validatePassword(password)) {
            return done(null, false, { message: 'email or password is invalid' });
        }
        return done(null, user);
    }).catch(done);
}));
passport_1.default.use(new passportMixer.Strategy({
    clientID: mixerClientId,
    clientSecret: mixerClientSecret,
    callbackURL: mixerCallbackUrl,
}, (accessToken, refreshToken, profile, done) => {
    const mixerUser = {
        _id: profile.id,
        user: {
            username: profile.username,
            userid: profile.id,
            channelid: profile._raw.channel.id,
        },
        tokens: {
            accessToken,
            refreshToken,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
        },
        provider: profile.provider,
    };
    return done(null, mixerUser);
}));
//# sourceMappingURL=passport.js.map