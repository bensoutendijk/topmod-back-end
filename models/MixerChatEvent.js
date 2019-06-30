const mongoose = require('mongoose');

const { Schema } = mongoose;

const mixerChatEventSchema = new Schema({
  type: String,
  event: String,
  data: Object,
  channel: Number,
});

mongoose.model('MixerChatEvent', mixerChatEventSchema);
