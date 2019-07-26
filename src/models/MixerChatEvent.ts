import mongoose from 'mongoose';

const { Schema } = mongoose;

const mixerChatEventSchema = new Schema({
  type: String,
  event: String,
  data: Object,
  channel: Number,
  createdAt: Date,
  updatedAt: Date,
});

mongoose.model('MixerChatEvent', mixerChatEventSchema);
