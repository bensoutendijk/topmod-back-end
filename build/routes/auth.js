"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_jwt_1 = __importDefault(require("express-jwt"));
const keys_1 = __importDefault(require("../config/keys"));
const getHttpOnlyToken = (req) => {
    const { token } = req.cookies;
    if (token && token.split(' ')[0] === 'Token') {
        return token.split(' ')[1];
    }
    return null;
};
const getToken = (req) => {
    const { token2 } = req.cookies;
    if (token2 && token2.split(' ')[0] === 'Token') {
        return token2.split(' ')[1];
    }
    return null;
};
const auth = {
    required: [
        express_jwt_1.default({
            secret: keys_1.default.jwtHttpOnlyKey,
            userProperty: 'payload',
            getToken: getHttpOnlyToken,
        }),
        express_jwt_1.default({
            secret: keys_1.default.jwtKey,
            userProperty: 'payload',
            getToken,
        }),
    ],
    optional: [
        express_jwt_1.default({
            secret: keys_1.default.jwtHttpOnlyKey,
            userProperty: 'payload',
            getToken: getHttpOnlyToken,
            credentialsRequired: false,
        }),
        express_jwt_1.default({
            secret: keys_1.default.jwtKey,
            userProperty: 'payload',
            getToken,
            credentialsRequired: false,
        }),
    ],
};
exports.default = auth;
//# sourceMappingURL=auth.js.map