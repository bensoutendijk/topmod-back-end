const router = require('express').Router();
const mongoose = require('mongoose');
const axios = require('axios');

const auth = require('../../auth');


const MixerUser = mongoose.model('MixerUser');

router.get('/streams', auth.required, async (req, res) => {
  const { payload: { _id } } = req;

  const profile = await MixerUser.findOne({ localUser: _id });
  const dateFrom = new Date(1970, 1, 1).toISOString();
  const URI = `https://mixer.com/api/v1/channels/${profile.user.channelid}/analytics/tsdb/streamSessions?from=${dateFrom}`;

  const { data } = await axios.get(URI, {
    headers: { Authorization: `bearer ${profile.tokens.accessToken}` },
  });

  res.send(data);
});

router.get('/users/:role', auth.required, async (req, res) => {
  const { payload: { _id } } = req;
  const { params: { role } } = req;
  const profile = await MixerUser.findOne({ localUser: _id });

  const URI = `https://mixer.com/api/v1/channels/${profile.user.channelid}/users/${role}`;

  const { data } = await axios.get(URI);

  res.send(data);
});

router.get('/viewers', auth.required, async (req, res) => {
  const { payload: { _id } } = req;
  let { query: { to: dateTo, from: dateFrom } } = req;

  if (!dateTo) {
    dateTo = new Date().toISOString();
  }

  if (!dateFrom) {
    dateFrom = new Date(1970, 1, 1).toISOString();
  }

  const profile = await MixerUser.findOne({ localUser: _id });

  const URI = `https://mixer.com/api/v1/channels/${profile.user.channelid}/analytics/tsdb/viewers?from=${dateFrom}&to=${dateTo}`;

  try {
    const { data } = await axios.get(URI, {
      headers: { Authorization: `bearer ${profile.tokens.accessToken}` },
    });
    res.send(data);
  } catch (err) {
    res.send(err.response.data);
  }
});

module.exports = router;
