import express from 'express';
import axios from 'axios';

import auth from '../../auth';
import mixerAuth from '../../oauth';

const router = express.Router();

router.get('/streams', auth.local.required, mixerAuth, async (req, res) => {
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
      const { data: streams } = await axios.get(streamsURI, {
        headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
      });

      const finalStreams = await Promise.all(streams.map(async (stream) => {
        const streamStart = new Date(stream.time).toISOString();
        const streamEnd = new Date(
          new Date(stream.time).getTime() + stream.duration * 1000,
        ).toISOString();

        const typesURI = `https://mixer.com/api/v1/types/${stream.type}`;
        const viewersURI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/viewers?from=${streamStart}&to=${streamEnd}`;
        const followersURI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/followers?from=${streamStart}&to=${streamEnd}`;
        const subscriptionsURI = `https://mixer.com/api/v1/channels/${mixerUser.user.channelid}/analytics/tsdb/subscriptions?from=${streamStart}&to=${streamEnd}`;

        // Assign Id to stream
        const streamId = `${new Date(stream.time).getTime()}${stream.channel}`;
        Object.assign(stream, { id: streamId });

        // Get type info from mixer API
        try {
          const { data: game } = await axios.get(typesURI);
          Object.assign(stream, { game });
        } catch (err) {
          console.log(err.response);
        }

        // Get Viewership info mixer API
        try {
          const { data: viewership } = await axios.get(viewersURI, {
            headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
          });
          Object.assign(stream, { viewership });
        } catch (err) {
          console.log(err.response);
        }

        // Get Followers info from mixer API
        try {
          const { data: followers } = await axios.get(followersURI, {
            headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
          });
          Object.assign(stream, { followers });
        } catch (err) {
          console.log(err.response);
        }

        // Get Subscriptions info from mixer API
        try {
          const { data: subscriptions } = await axios.get(subscriptionsURI, {
            headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
          });
          Object.assign(stream, { subscriptions });
        } catch (err) {
          console.log(err.response);
        }

        return stream;
      }));

      return res.send(finalStreams);
    } catch (err) {
      console.log(err.response);
    }
  }
  return res.sendStatus(400);
});

router.get('/users/:role', auth.local.required, mixerAuth, async (req, res) => {
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

router.get('/viewers', auth.local.required, mixerAuth, async (req, res) => {
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

export default router;
