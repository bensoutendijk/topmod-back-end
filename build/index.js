"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const keys_1 = __importDefault(require("./config/keys"));
// Connect to Database
mongoose_1.default.Promise = global.Promise;
mongoose_1.default.connect(keys_1.default.mongoURI, { useNewUrlParser: true });
require('./models/LocalUser');
require('./models/MixerUser');
require('./models/MixerChatEvent');
require('./services/passport');
// Create express app
const routes_1 = __importDefault(require("./routes"));
const app = express_1.default();
app.use(cookie_parser_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(cors_1.default());
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(routes_1.default);
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('Listening on port ', PORT);
});
//# sourceMappingURL=index.js.map