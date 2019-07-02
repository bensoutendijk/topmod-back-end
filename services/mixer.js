const Mixer = require('@mixer/client-node');
const ws = require('ws');

const mongoose = require('mongoose');

const keys = require('../config/keys');

const MixerChatEvent = mongoose.model('MixerChatEvent');
const MixerUser = mongoose.model('MixerUser');

function getUsers() {
  return MixerUser.find({});
}

function getMixerClient(profile) {
  const client = new Mixer.Client(new Mixer.DefaultRequestRunner());
  client.use(new Mixer.OAuthProvider(client, {
    clientId: keys.mixerClientId,
    secret: keys.mixerClientSecret,
    tokens: {
      access: profile.tokens.accessToken,
      refresh: profile.tokens.refreshToken,
      expires: Date.now() + (365 * 24 * 60 * 60 * 1000),
    },
  }));
  return client;
}

function refresh(client, profile) {
  const oauth = client.getProvider();
  oauth.refresh()
    .then(() => {
      const { access: accessToken, refresh: refreshToken } = oauth.tokens;
      profile.set('tokens', {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
      });
      return profile.save();
    })
    .catch((err) => {
      console.log('Unable to refresh tokens');
      console.log(err);
    });
}

async function connect(client, profile) {
  const res = await new Mixer.ChatService(client).join(profile.user.channelid);
  const { body: chat } = res;
  const socket = new Mixer.Socket(ws, chat.endpoints).boot();
  if (chat.authkey) {
    try {
      console.log(`${profile.user.username}'s been authenticated`);
      socket.auth(profile.user.channelid, profile.user.userid, chat.authkey);
    } catch (err) {
      console.log('Auth error');
      console.log(err);
    }
  }
  return socket;
}

async function start() {
  const users = await getUsers();
  users.forEach(async (profile) => {
    const client = getMixerClient(profile);
    await refresh(client, profile);
    const socket = await connect(client, profile);

    socket.on('error', (error) => {
      console.error('Socket error');
      console.error(error);
    });

    socket.on('ChatMessage', (data) => {
      console.log(data);
    });
  });
}

start();
