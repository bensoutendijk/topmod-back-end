const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../../auth');

const MixerUser = mongoose.model('MixerUser');
const MixerChatEvent = mongoose.model('MixerChatEvent');

router.get('/', auth.required, async (req, res) => {
  const { payload: { _id } } = req;

  const profile = await MixerUser.findOne({ localUser: _id });
  const chat = await MixerChatEvent.find({ channel: profile.user.channelid });

  res.send(chat);
});

module.exports = router;
