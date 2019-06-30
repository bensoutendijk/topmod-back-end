const Mixer = require('@mixer/client-node');
const ws = require('ws');
const mongoose = require('mongoose');

const MixerChatEvent = mongoose.model('MixerChatEvent');
const MixerUser = mongoose.model('MixerUser');

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
  });
}

MixerUser.find({}, (err, users) => {
  users.forEach((profile) => {
    const client = new Mixer.Client(new Mixer.DefaultRequestRunner());
    client.use(new Mixer.OAuthProvider(client, {
      tokens: {
        access: profile.tokens.accessToken,
        expires: Date.now() + (365 * 24 * 60 * 60 * 1000),
      },
    }));
    new Mixer.ChatService(client).join(profile.user.channelid)
      .then((response) => {
        const { body } = response;
        return createChatSocket(
          profile.user.userid,
          profile.user.channelid,
          body.endpoints,
          body.authkey,
        );
      })
      .catch((error) => {
        console.error('Something went wrong.');
        console.error(error);
      });
  });
});
