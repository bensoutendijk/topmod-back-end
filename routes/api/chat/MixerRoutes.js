const router = require('express').Router();
const axios = require('axios');
const mongoose = require('mongoose');
const auth = require('../../auth');

const MixerUser = mongoose.model('MixerUser');

router.get('/history', auth.required, async (req, res) => {
  const { payload: { _id } } = req;

  const profile = await MixerUser.findOne({ localUser: _id });
  const URI = `https://mixer.com/api/v1/chats/${profile.user.channelid}/history`;

  const { data } = await axios.get(URI, {
    headers: { Authorization: `bearer ${profile.tokens.accessToken}` },
  });

  res.send(data);
});

router.get('/', auth.required, async (req, res) => {
  const { payload: { _id } } = req;

  const profile = await MixerUser.findOne({ localUser: _id });
  const URI = `https://mixer.com/api/v1/chats/${profile.user.channelid}`;

  const { data } = await axios.get(URI, {
    headers: { Authorization: `bearer ${profile.tokens.accessToken}` },
  });

  res.send(data);
});

module.exports = router;
