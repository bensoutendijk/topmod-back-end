const router = require('express').Router();
const axios = require('axios');
const mongoose = require('mongoose');
const auth = require('../../auth');

const MixerUser = mongoose.model('MixerUser');

router.get('/history', auth.required, async (req, res) => {
  const { payload: { _id } } = req;

  const mixerUser = await MixerUser.findOne({ localUser: _id });

  if (mixerUser) {
    const URI = `https://mixer.com/api/v1/chats/${mixerUser.user.channelid}/history`;

    const { data } = await axios.get(URI, {
      headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
    });

    return res.send(data);
  }

  return res.sendStatus(400);
});

router.get('/', auth.required, async (req, res) => {
  const { payload: { _id } } = req;

  const mixerUser = await MixerUser.findOne({ localUser: _id });
  if (mixerUser) {
    const URI = `https://mixer.com/api/v1/chats/${mixerUser.user.channelid}`;

    const { data } = await axios.get(URI, {
      headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
    });

    return res.send(data);
  }
  return res.sendStatus(400);
});

module.exports = router;
