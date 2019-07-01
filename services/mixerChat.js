const Mixer = require('@mixer/client-node');
const ws = require('ws');
const mongoose = require('mongoose');
const keys = require('../config/keys');

const MixerChatEvent = mongoose.model('MixerChatEvent');
const MixerUser = mongoose.model('MixerUser');

async function mixerChat() {
  const users = await MixerUser.find({});
  users.forEach(async (profile) => {
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

    const oauth = client.getProvider();
    oauth.refresh().then(() => {
      const { access, refresh } = client.getProvider().tokens;
      profile.tokens = {
        accessToken: access,
        refreshToken: refresh,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
      };
      try {
        profile.save();
        console.log(`${profile.user.username}'s tokens successfully updated!`);
      } catch (err) {
        console.log(err);
      }
    });

    const { body: chat } = await new Mixer.ChatService(client).join(profile.user.channelid);

    const socket = new Mixer.Socket(ws, chat.endpoints).boot();

    if (chat.authkey) {
      try {
        console.log(`${profile.user.username}'s been authenticated`);
        socket.auth(profile.user.channelid, profile.user.userid, chat.authkey);
      } catch (err) {
        console.log('Auth error');
        console.log(err);
      }
    } else {
      try {
        console.log(`${profile.user.username} not authenticated`);
        socket.auth(profile.user.channelid);
      } catch (err) {
        console.log('Auth error');
        console.log(err);
      }
    }

    socket.on('error', (error) => {
      console.error('Socket error');
      console.error(error);
    });

    socket.on('ChatMessage', (data) => {
      console.log(data);
    });
  });
}

mixerChat();

function createChatSocket(userId, channelId, endpoints, authkey) {
  const socket = new Mixer.Socket(ws, endpoints).boot();

  // You don't need to wait for the socket to connect before calling
  // methods. We spool them and run them when connected automatically.
  socket.auth(channelId, userId, authkey)
    .then(() => {
      console.log(`${userId} authenticated!`);
    })
    .catch((error) => {
      console.error('Oh no! An error occurred.');
      console.error(error);
    });

  // Listen for chat messages. Note you will also receive your own!
  socket.on('ChatMessage', (data) => {
    const chatEvent = new MixerChatEvent({
      type: 'event',
      event: 'ChatMessage',
      channel: channelId,
      data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    try {
      chatEvent.save();
    } catch (err) {
      console.log(err);
    }
  });

  socket.on('DeleteMessage', (data) => {
    const chatEvent = new MixerChatEvent({
      type: 'event',
      event: 'DeleteMessage',
      channel: channelId,
      data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    try {
      chatEvent.save();
    } catch (err) {
      console.log(err);
    }
  });

  socket.on('UserUpdate', (data) => {
    const chatEvent = new MixerChatEvent({
      type: 'event',
      event: 'UserUpdate',
      channel: channelId,
      data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    try {
      chatEvent.save();
    } catch (err) {
      console.log(err);
    }
  });

  // Listen for socket errors. You will need to handle these here.
  socket.on('error', (error) => {
    console.error('Socket error');
    console.error(error);
    throw new Error(error);
  });
}
