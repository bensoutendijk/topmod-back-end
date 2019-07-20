const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../../auth');
const Mixer = require('../../mixer');


const MixerUser = mongoose.model('MixerUser');
const MixerChatEvent = mongoose.model('MixerChatEvent');

router.get('/history', auth.required, async (req, res) => {
  const { payload: { _id } } = req;

  const profile = await MixerUser.findOne({ localUser: _id });
  const chat = await MixerChatEvent.find({ channel: profile.user.channelid });

  res.send(chat);
});

router.get('/', auth.required, async (req, res) => {
  const { payload: { _id } } = req;

  const profile = await MixerUser.findOne({ localUser: _id });
  const { user: { channelid } } = profile;
  const client = await Mixer.getMixerClient(profile);
  const { body: chat } = await client.request('GET', `/chats/${channelid}`);
  res.send(chat);
});

module.exports = router;
