const MixerClient = require('@mixer/client-node');
const ws = require('ws');

const mongoose = require('mongoose');

const keys = require('../config/keys');

const MixerChatEvent = mongoose.model('MixerChatEvent');
const MixerUser = mongoose.model('MixerUser');

const Mixer = {
  getUsers() {
    return MixerUser.find({});
  },

  getMixerClient(profile) {
    const client = new MixerClient.Client(new MixerClient.DefaultRequestRunner());
    client.use(new MixerClient.OAuthProvider(client, {
      clientId: keys.mixerClientId,
      secret: keys.mixerClientSecret,
      tokens: {
        access: profile.tokens.accessToken,
        refresh: profile.tokens.refreshToken,
        expires: Date.now() + (365 * 24 * 60 * 60 * 1000),
      },
    }));
    return client;
  },

  refresh(client, profile) {
    const oauth = client.getProvider();
    oauth.refresh()
      .then(() => {
        const { access: accessToken, refresh: refreshToken } = oauth.tokens;
        profile.set('tokens', {
          accessToken,
          refreshToken,
          expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
        });
        profile.set('updatedAt', Date.now());
        return profile.save();
      })
      .catch((err) => {
        console.log('Unable to refresh tokens');
        console.log(err);
      });
  },

  async connect(client, profile) {
    const { user: { channelid, username, userid } } = profile;
    const res = await new MixerClient.ChatService(client).join(channelid);
    const { body: chat } = res;
    const socket = new MixerClient.Socket(ws, chat.endpoints).boot();
    if (chat.authkey) {
      try {
        console.log(`${username}'s been authenticated`);
        socket.auth(channelid, userid, chat.authkey);
      } catch (err) {
        console.log('Auth error');
        console.log(err);
      }
    }

    socket.on('error', (error) => {
      console.error('Socket error');
      console.error(error);
    });

    const events = [
      'ChatMessage',
      'DeleteMessage',
      'UserJoin',
      'UserLeave',
      'SkillAttribution',
    ];
    events.forEach((event) => {
      socket.on(event, (data) => {
        const chatEvent = new MixerChatEvent({
          type: 'event',
          event,
          channel: channelid,
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
    });

    return socket;
  },

  async start() {
    const users = await this.getUsers();
    users.forEach(async (profile) => {
      const client = this.getMixerClient(profile);
      await this.refresh(client, profile);
      await this.connect(client, profile);
    });
  },
};

module.exports = Mixer;
