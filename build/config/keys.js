"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const prod = __importStar(require("./prod"));
const dev = __importStar(require("./dev"));
exports.default = (process.env.NODE_ENV === 'production') ? (prod) : (dev);
//# sourceMappingURL=keys.js.map