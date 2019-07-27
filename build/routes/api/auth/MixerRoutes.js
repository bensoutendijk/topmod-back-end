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
const passport_1 = __importDefault(require("passport"));
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../auth"));
const mixer_1 = __importDefault(require("../../mixer"));
const router = express_1.default.Router();
const LocalUser = mongoose_1.default.model('LocalUser');
const MixerUser = mongoose_1.default.model('MixerUser');
const createMixerUser = (mixerProfile, localUser) => __awaiter(this, void 0, void 0, function* () {
    const finalMixerUser = new MixerUser({
        localUser: localUser._id,
        user: {
            username: mixerProfile.user.username,
            userid: mixerProfile._id,
            channelid: mixerProfile.user.channelid,
        },
        tokens: {
            accessToken: mixerProfile.tokens.accessToken,
            refreshToken: mixerProfile.tokens.refreshToken,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365,
        },
        provider: mixerProfile.provider,
    });
    localUser.services.push('mixer');
    try {
        yield finalMixerUser.save();
        yield localUser.save();
    }
    catch (err) {
        console.log(err);
    }
});
const updateMixerUser = (mixerProfile, mixerUser) => __awaiter(this, void 0, void 0, function* () {
    Object.assign(mixerUser, mixerProfile);
    try {
        yield mixerUser.save();
    }
    catch (err) {
        console.log(err);
    }
});
router.get('/login', auth_1.default.required, passport_1.default.authenticate('mixer', {
    scope: [
        'chat:connect',
        'chat:view_deleted',
        'channel:analytics:self',
        'channel:details:self',
        'user:details:self',
        'user:analytics:self',
    ],
}));
router.get('/callback', auth_1.default.required, passport_1.default.authenticate('mixer', { failureRedirect: '/login' }), (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { user: mixerProfile } = req;
    const { payload: localProfile } = req;
    const mixerUser = yield MixerUser.findOne({ user: { userid: mixerProfile._id } });
    const localUser = yield LocalUser.findById(localProfile._id);
    if (mixerUser) {
        updateMixerUser(mixerProfile, mixerUser);
    }
    else {
        createMixerUser(mixerProfile, localUser);
    }
    // Successful authentication, redirect home.
    return res.redirect('/');
}));
router.get('/current', auth_1.default.required, mixer_1.default.auth, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { mixerUser } = req;
    if (mixerUser) {
        return res.send(mixerUser.user);
    }
    return res.sendStatus(400);
}));
exports.default = router;
//# sourceMappingURL=MixerRoutes.js.map