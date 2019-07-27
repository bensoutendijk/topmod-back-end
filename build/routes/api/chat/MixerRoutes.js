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
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("../../auth"));
const router = express_1.default.Router();
const MixerUser = mongoose_1.default.model('MixerUser');
router.get('/history', auth_1.default.required, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { payload: { _id } } = req;
    const mixerUser = yield MixerUser.findOne({ localUser: _id });
    if (mixerUser) {
        const URI = `https://mixer.com/api/v1/chats/${mixerUser.user.channelid}/history`;
        const { data } = yield axios_1.default.get(URI, {
            headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
        });
        return res.send(data);
    }
    return res.sendStatus(400);
}));
router.get('/', auth_1.default.required, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { payload: { _id } } = req;
    const mixerUser = yield MixerUser.findOne({ localUser: _id });
    if (mixerUser) {
        const URI = `https://mixer.com/api/v1/chats/${mixerUser.user.channelid}`;
        const { data } = yield axios_1.default.get(URI, {
            headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
        });
        return res.send(data);
    }
    return res.sendStatus(400);
}));
exports.default = router;
//# sourceMappingURL=MixerRoutes.js.map