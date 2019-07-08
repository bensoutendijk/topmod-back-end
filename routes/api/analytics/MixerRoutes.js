const router = require('express').Router();
const mongoose = require('mongoose');

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

module.exports = router;
