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
const router = express_1.default.Router();
const LocalUser = mongoose_1.default.model('LocalUser');
// POST new user route (optional, everyone has access)
router.post('/', auth_1.default.optional, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { body: user } = req;
    if (!user.email) {
        return res.status(422).json({
            email: 'is required',
        });
    }
    if (!user.password) {
        return res.status(422).json({
            password: 'is required',
        });
    }
    if (!user.passwordConfirmation) {
        return res.status(422).json({
            passwordConfirmation: 'is required',
        });
    }
    if (user.password !== user.passwordConfirmation) {
        return res.status(442).json({
            passwordConfirmation: 'does not match',
        });
    }
    const existingUser = yield LocalUser.findOne({ email: user.email });
    if (!existingUser) {
        const finalUser = new LocalUser(user);
        finalUser.setPassword(user.password);
        try {
            yield finalUser.save();
        }
        catch (err) {
            return res.json({
                user: 'Something went wrong',
            });
        }
        res.cookie('token', `Token ${finalUser.generateHttpOnlyJWT()}`, {
            expires: new Date(Date.now() + 1000 * 60 * 30),
            httpOnly: true,
        });
        res.cookie('token2', `Token ${finalUser.generateJWT()}`, {
            expires: new Date(Date.now() + 1000 * 60 * 30),
        });
        return res.json({ user: finalUser.toJSON() });
    }
    return res.status(442).json({
        email: 'already exists',
    });
}));
// POST login route (optional, everyone has access)
router.post('/login', auth_1.default.optional, (req, res, next) => {
    const { body: user } = req;
    if (!user.email) {
        return res.status(422).json({
            email: 'is required',
        });
    }
    if (!user.password) {
        return res.status(422).json({
            password: 'is required',
        });
    }
    return passport_1.default.authenticate('local', { session: false }, (err, passportUser) => {
        if (err) {
            return next(err);
        }
        if (passportUser) {
            res.cookie('token', `Token ${passportUser.generateHttpOnlyJWT()}`, {
                expires: new Date(Date.now() + 1000 * 60 * 30),
                httpOnly: true,
            });
            res.cookie('token2', `Token ${passportUser.generateJWT()}`, {
                expires: new Date(Date.now() + 1000 * 60 * 30),
            });
            return res.json({ user: passportUser.toJSON() });
        }
        return res.status(422).json({
            authentication: 'email not registered',
        });
    })(req, res, next);
});
// GET current route (required, only authenticated users have access)
router.get('/current', auth_1.default.required, (req, res) => {
    const { payload: { _id } } = req;
    LocalUser.findById(_id)
        .then((user) => {
        if (!user) {
            return res.sendStatus(400);
        }
        res.cookie('token', `Token ${user.generateHttpOnlyJWT()}`, {
            expires: new Date(Date.now() + 1000 * 60 * 30),
            httpOnly: true,
        });
        res.cookie('token2', `Token ${user.generateJWT()}`, {
            expires: new Date(Date.now() + 1000 * 60 * 30),
        });
        return res.json({ user: user.toJSON() });
    });
});
exports.default = router;
//# sourceMappingURL=LocalRoutes.js.map