const router = require('express').Router();
const mongoose = require('mongoose');
const axios = require('axios');

const Mixer = require('../../mixer');
const auth = require('../../auth');


const MixerUser = mongoose.model('MixerUser');

router.get('/streams', auth.required, async (req, res) => {
  const { payload: { _id } } = req;

  const profile = await MixerUser.findOne({ localUser: _id });
  const fromDate = new Date(1970, 1, 1).toISOString();
  const URI = `/channels/${profile.user.channelid}/analytics/tsdb/streamSessions?from=${fromDate}`;

  const client = await Mixer.getMixerClient(profile);

  const { body: streamList } = await client.request('GET', URI);

  res.send(streamList);
});

router.get('/users/:role', auth.required, async (req, res) => {
  const { payload: { _id } } = req;
  const { params: { role } } = req;
  const profile = await MixerUser.findOne({ localUser: _id });

  const URI = `https://mixer.com/api/v1/channels/${profile.user.channelid}/users/${role}`;

  const { data } = await axios.get(URI);

  res.send(data);
});

module.exports = router;
