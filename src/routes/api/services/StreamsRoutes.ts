import express from 'express';
import axios from 'axios';
import auth from '../../auth';
import oauth from '../../oauth';

const router = express.Router();

router.get('/', auth.local.required, oauth, async (req, res) => {
  const { service } = req;

  let { query: { to: dateTo, from: dateFrom } } = req;

  if (!dateTo) {
    dateTo = new Date().toISOString();
  }

  if (!dateFrom) {
    dateFrom = new Date(1970, 1, 1).toISOString();
  }

  switch (service.provider) {
    case 'mixer':
      const streamsURI = `https://mixer.com/api/v1/channels/${service.user.channelid}/analytics/tsdb/streamSessions?from=${dateFrom}&to=${dateTo}`;

      let { data: streams } = await axios.get(streamsURI, {
        headers: { Authorization: `bearer ${service.tokens.accessToken}` },
      });

      streams = streams.map(stream => ({
        ...stream,
        _id: stream.time,
      }));

      return res.send(streams);
    default:
      return res.status(400).send({ service: 'unable to get streams' })
  }

  

});

export default router;
