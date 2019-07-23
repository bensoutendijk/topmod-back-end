const router = require('express').Router();
const mongoose = require('mongoose');
const axios = require('axios');

const auth = require('../../auth');
const mixer = require('../../mixer');

const MixerUser = mongoose.model('MixerUser');

router.get('/streams', auth.required, mixer.auth, async (req, res) => {
  const { mixerUser } = req;
  const dateFrom = new Date(1970, 1, 1).toISOString();
  if (mixerUser) {
    const URI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/streamSessions?from=${dateFrom}`;

    try {
      const { data } = await axios.get(URI, {
        headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
      });
      console.log('getting streams');
      return res.send(data);
    } catch (err) {
      console.log(err);
    }
  }
  return res.sendStatus(400);
});

router.get('/users/:role', auth.required, async (req, res) => {
  const { payload: { _id } } = req;
  const { params: { role } } = req;
  const mixerUser = await MixerUser.findOne({ localUser: _id });
  if (mixerUser) {
    const URI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/users/${role}`;

    const { data } = await axios.get(URI);

    return res.send(data);
  }
  return res.sendStatus(400);
});

router.get('/viewers', auth.required, mixer.auth, async (req, res) => {
  const { mixerUser } = req;
  let { query: { to: dateTo, from: dateFrom } } = req;

  if (!dateTo) {
    dateTo = new Date().toISOString();
  }

  if (!dateFrom) {
    dateFrom = new Date(1970, 1, 1).toISOString();
  }

  if (mixerUser) {
    const URI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/viewers?from=${dateFrom}&to=${dateTo}`;

    try {
      const { data } = await axios.get(URI, {
        headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
      });
      return res.send(data);
    } catch (err) {
      return res.send(err.response.data);
    }
  }

  return res.sendStatus(400);
});

module.exports = router;
