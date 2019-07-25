const router = require('express').Router();
const axios = require('axios');
const uuid = require('uuid');

const auth = require('../../auth');
const mixer = require('../../mixer');

router.get('/streams', auth.required, mixer.auth, async (req, res) => {
  const { mixerUser } = req;
  let { query: { to: dateTo, from: dateFrom } } = req;

  if (!dateTo) {
    dateTo = new Date().toISOString();
  }

  if (!dateFrom) {
    dateFrom = new Date(1970, 1, 1).toISOString();
  }

  if (mixerUser) {
    const streamsURI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/streamSessions?from=${dateFrom}&to=${dateTo}`;

    try {
      const { data } = await axios.get(streamsURI, {
        headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
      });

      const streams = await Promise.all(data.map(async (stream) => {
        const streamId = `${new Date(stream.time).getTime()}${stream.channel}`;
        const streamStart = new Date(stream.time).toISOString();
        const streamEnd = new Date(
          new Date(stream.time).getTime() + stream.duration * 1000,
        ).toISOString();

        const typesURI = `https://mixer.com/api/v1/types/${stream.type}`;
        const viewersURI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/viewers?from=${streamStart}&to=${streamEnd}`;
        const followersURI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/followers?from=${streamStart}&to=${streamEnd}`;
        const subscriptionsURI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/subscriptions?from=${streamStart}&to=${streamEnd}`;
        
        // Get type info from mixer API
        const { data: game } = await axios.get(typesURI);

        // Get Viewership info mixer API
        const { data: viewership } = await axios.get(viewersURI, {
          headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
        });

        // Get Followers info from mixer API
        const { data: followers } = await axios.get(followersURI, {
          headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
        });

        // Get Subscriptions info from mixer API
        const { data: subscriptions } = await axios.get(subscriptionsURI, {
          headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
        });

        Object.assign(stream, {
          id: streamId,
          game,
          viewership,
          followers,
          subscriptions,
        });

        return stream;
      }));

      return res.send(streams);
    } catch (err) {
      console.log(err);
    }
  }
  return res.sendStatus(400);
});

router.get('/users/:role', auth.required, mixer.auth, async (req, res) => {
  const { mixerUser } = req;
  const { params: { role } } = req;
  if (mixerUser) {
    try {
      const URI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/users/${role}`;
      const { data } = await axios.get(URI);

      const users = await Promise.all(data.map(async (user) => {
        const chattersURI = `https://mixer.com/api/v2/chats/${mixerUser.user.channelid}/users/${user.id}`;

        try {
          const { data: chatter } = await axios.get(chattersURI);
          if (chatter.userId === user.id) {
            Object.assign(user, { active: true });
          }
        } catch (err) {
          Object.assign(user, { active: false });
        }
        return user;
      }));

      return res.send(users);
    } catch (err) {
      console.log(err);
    }
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
