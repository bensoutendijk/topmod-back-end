import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import auth from '../../auth';
import { ILocalUserModel } from '../../../models/LocalUser';
import { OAuthUserModel } from '../../../models/OAuthUser';

const LocalUser = mongoose.model<ILocalUserModel>('LocalUser');
const OAuthUser = mongoose.model<OAuthUserModel>('OAuthUser');

const router = express.Router();

router.get('/', auth.local.required, async (req, res) => {
  const { localAuth: { _id }, provider, username } = req;

  const { services } = await LocalUser.findById(_id) as ILocalUserModel;
  const users = await OAuthUser.find({ _id: { $in: services } }) as OAuthUserModel[];

  const service = users.filter(user => (
    user.provider.toLowerCase() === provider.toLowerCase() &&
    user.user.username.toLowerCase() === username.toLowerCase()
  ))[0];

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
      }))

      return res.send(streams);
    default:
      return res.status(400).send({ service: 'unable to get streams' })
  }

  

});

export default router;
