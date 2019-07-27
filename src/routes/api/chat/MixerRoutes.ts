import express from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import auth from '../../auth';
import { IMixerUserModel } from '../../../models/MixerUser';

const router = express.Router();
const MixerUser = mongoose.model('MixerUser');

router.get('/history', auth.local.required, async (req, res) => {
  const { localAuth } = req;

  const mixerUser = await MixerUser.findOne({ localUser: localAuth._id }) as IMixerUserModel;

  if (mixerUser) {
    const URI = `https://mixer.com/api/v1/chats/${mixerUser.user.channelid}/history`;

    const { data } = await axios.get(URI, {
      headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
    });

    return res.send(data);
  }

  return res.sendStatus(400);
});

router.get('/', auth.local.required, async (req, res) => {
  const { localAuth } = req;

  const mixerUser = await MixerUser.findOne({ localUser: localAuth._id }) as IMixerUserModel;
  if (mixerUser) {
    const URI = `https://mixer.com/api/v1/chats/${mixerUser.user.channelid}`;

    const { data } = await axios.get(URI, {
      headers: { Authorization: `bearer ${mixerUser.tokens.accessToken}` },
    });

    return res.send(data);
  }
  return res.sendStatus(400);
});

export default router;
