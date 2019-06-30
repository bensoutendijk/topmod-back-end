const mongoose = require('mongoose');

const { Schema } = mongoose;

const mixerChatEventSchema = new Schema({
  _id: String,
  channel: Number,
  user_name: String,
  user_id: Number,
  user_roles: Array,
  user_level: Number,
  user_avatar: String,
  message: Object,
  user_ascension_level: Number,
});

mongoose.model('MixerChatEvent', mixerChatEventSchema);
