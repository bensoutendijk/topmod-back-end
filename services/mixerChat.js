const Mixer = require('@mixer/client-node');
const ws = require('ws');
const mongoose = require('mongoose');

const MixerChatEvent = mongoose.model('MixerChatEvent');

function createChatSocket(userId, channelId, endpoints, authkey) {
  const socket = new Mixer.Socket(ws, endpoints).boot();

  // You don't need to wait for the socket to connect before calling
  // methods. We spool them and run them when connected automatically.
  socket.auth(channelId, userId, authkey)
    .then(() => {
      console.log('You are now authenticated!');
      // Send a chat message
      // return socket.call('msg', ['Hello world!']);
    })
    .catch((error) => {
      console.error('Oh no! An error occurred.');
      console.error(error);
    });

  // Listen for chat messages. Note you will also receive your own!
  socket.on('ChatMessage', (data) => {
    console.log('We got a ChatMessage packet!');
    console.log(data);
    const chatEvent = new MixerChatEvent(data);
    chatEvent._id = data.id;
    try {
      chatEvent.save(data);
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

const client = new Mixer.Client(new Mixer.DefaultRequestRunner());
client.use(new Mixer.OAuthProvider(client, {}));

new Mixer.ChatService(client).join(22984210)
  .then((response) => {
    const { body } = response;
    return createChatSocket(null, 22984210, body.endpoints);
  })
  .catch((error) => {
    console.error('Something went wrong.');
    console.error(error);
  });
