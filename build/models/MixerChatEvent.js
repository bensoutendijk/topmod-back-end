"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const mixerChatEventSchema = new Schema({
    type: String,
    event: String,
    data: Object,
    channel: Number,
    createdAt: Date,
    updatedAt: Date,
});
mongoose_1.default.model('MixerChatEvent', mixerChatEventSchema);
//# sourceMappingURL=MixerChatEvent.js.map