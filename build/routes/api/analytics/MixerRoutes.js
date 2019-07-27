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
const auth_1 = __importDefault(require("../../auth"));
const mixer_1 = __importDefault(require("../../mixer"));
const router = express_1.default.Router();
router.get('/streams', auth_1.default.required, mixer_1.default.auth, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { mixerUser } = req;
    let { query: { to: dateTo, from: dateFrom } } = req;
    if (!dateTo) {
        dateTo = new Date().toISOString();
    }
    if (!dateFrom) {
        dateFrom = new Date(1970, 1, 1).toISOString();
    }
    if (mixerUser) {
        const streamsURI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/streamSessions?from=${dateFrom}&to=${dateTo}`;
        try {
            const { data: streams } = yield axios_1.default.get(streamsURI, {
                headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
            });
            const finalStreams = yield Promise.all(streams.map((stream) => __awaiter(this, void 0, void 0, function* () {
                const streamStart = new Date(stream.time).toISOString();
                const streamEnd = new Date(new Date(stream.time).getTime() + stream.duration * 1000).toISOString();
                const typesURI = `https://mixer.com/api/v1/types/${stream.type}`;
                const viewersURI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/viewers?from=${streamStart}&to=${streamEnd}`;
                const followersURI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/followers?from=${streamStart}&to=${streamEnd}`;
                const subscriptionsURI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/subscriptions?from=${streamStart}&to=${streamEnd}`;
                // Assign Id to stream
                const streamId = `${new Date(stream.time).getTime()}${stream.channel}`;
                Object.assign(stream, { id: streamId });
                // Get type info from mixer API
                try {
                    const { data: game } = yield axios_1.default.get(typesURI);
                    Object.assign(stream, { game });
                }
                catch (err) {
                    console.log(err.response);
                }
                // Get Viewership info mixer API
                try {
                    const { data: viewership } = yield axios_1.default.get(viewersURI, {
                        headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
                    });
                    Object.assign(stream, { viewership });
                }
                catch (err) {
                    console.log(err.response);
                }
                // Get Followers info from mixer API
                try {
                    const { data: followers } = yield axios_1.default.get(followersURI, {
                        headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
                    });
                    Object.assign(stream, { followers });
                }
                catch (err) {
                    console.log(err.response);
                }
                // Get Subscriptions info from mixer API
                try {
                    const { data: subscriptions } = yield axios_1.default.get(subscriptionsURI, {
                        headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
                    });
                    Object.assign(stream, { subscriptions });
                }
                catch (err) {
                    console.log(err.response);
                }
                return stream;
            })));
            return res.send(finalStreams);
        }
        catch (err) {
            console.log(err.response);
        }
    }
    return res.sendStatus(400);
}));
router.get('/users/:role', auth_1.default.required, mixer_1.default.auth, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { mixerUser } = req;
    const { params: { role } } = req;
    if (mixerUser) {
        try {
            const URI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/users/${role}`;
            const { data } = yield axios_1.default.get(URI);
            const users = yield Promise.all(data.map((user) => __awaiter(this, void 0, void 0, function* () {
                const chattersURI = `https://mixer.com/api/v2/chats/${mixerUser.user.channelid}/users/${user.id}`;
                try {
                    const { data: chatter } = yield axios_1.default.get(chattersURI);
                    if (chatter.userId === user.id) {
                        Object.assign(user, { active: true });
                    }
                }
                catch (err) {
                    Object.assign(user, { active: false });
                }
                return user;
            })));
            return res.send(users);
        }
        catch (err) {
            console.log(err);
        }
    }
    return res.sendStatus(400);
}));
router.get('/viewers', auth_1.default.required, mixer_1.default.auth, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { mixerUser } = req;
    let { query: { to: dateTo, from: dateFrom } } = req;
    if (!dateTo) {
        dateTo = new Date().toISOString();
    }
    if (!dateFrom) {
        dateFrom = new Date(1970, 1, 1).toISOString();
    }
    if (mixerUser) {
        const URI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/viewers?from=${dateFrom}&to=${dateTo}`;
        try {
            const { data } = yield axios_1.default.get(URI, {
                headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
            });
            return res.send(data);
        }
        catch (err) {
            return res.send(err.response.data);
        }
    }
    return res.sendStatus(400);
}));
exports.default = router;
//# sourceMappingURL=MixerRoutes.js.map