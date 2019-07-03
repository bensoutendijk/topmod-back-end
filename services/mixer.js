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
  const events = [
    'ChatMessage',
    'DeleteMessage',
    'UserJoin',
    'UserLeave',
    'SkillAttribution',
  ];

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

  socket.on('error', (error) => {
    console.error('Socket error');
    console.error(error);
  });

  events.forEach((event) => {
    socket.on(event, (data) => {
      console.log(data);
    });
  });

  socket.on('ChatMessage', (data) => {
    console.log(data);
  });
  socket.on('DeleteMessage', (data) => {
    console.log(data);
  });
  socket.on('UserJoin', (data) => {
    console.log(data);
  });
  socket.on('UserLeave', (data) => {
    console.log(data);
  });
  socket.on('SkillAttribution', (data) => {
    console.log(data);
  });

  return socket;
}

async function start() {
  const users = await getUsers();
  users.forEach(async (profile) => {
    const client = getMixerClient(profile);
    await refresh(client, profile);
    const socket = await connect(client, profile);
  });
}

start();
