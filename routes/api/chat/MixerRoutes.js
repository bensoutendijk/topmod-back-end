const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../../auth');

const MixerUser = mongoose.model('MixerUser');
const MixerChatEvent = mongoose.model('MixerChatEvent');

router.get('/:userid', auth.required, async (req, res) => {
  const { params: { userid }, payload: { _id } } = req;

  if (userid === _id) {
    const profile = await MixerUser.findById(userid);
    const chat = await MixerChatEvent.find({ channel: profile.user.channelid });
    res.send(chat);
  }
});

module.exports = router;
