const MixerClient = require('@mixer/client-node');
const ws = require('ws');

const mongoose = require('mongoose');

const keys = require('../config/keys');

const MixerChatEvent = mongoose.model('MixerChatEvent');
const MixerUser = mongoose.model('MixerUser');

const Mixer = {
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

  async refresh(client, profile) {
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
    console.log('Getting Chat Endpoints...');
    const { body: chat } = await client.request('GET', `/chats/${channelid}`);
    console.log('Booting WebSocket...');
    const socket = new MixerClient.Socket(ws, chat.endpoints).boot();

    const accessToken = client.getProvider().tokens.access;
    const refreshToken = client.getProvider().tokens.refresh;

    const { body: accessTokenIntrospect } = await client.request(
      'POST',
      '/oauth/token/introspect',
      {
        body: {
          token: accessToken,
        },
      },
    );
    const { body: refreshTokenIntrospect } = await client.request(
      'POST',
      '/oauth/token/introspect',
      {
        body: {
          token: refreshToken,
        },
      },
    );

    if (chat.authkey) {
      try {
        socket.auth(channelid, userid, chat.authkey);
        console.log(`${username}'s been authenticated`);
      } catch (err) {
        console.log('Auth error');
        console.log(err);
      }
    } else {
      console.log('No Chat Authentication Key Found');
      console.log(accessTokenIntrospect);
      console.log(refreshTokenIntrospect);
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
    console.log('Starting Mixer Service');
    const users = await MixerUser.find({});
    console.log(`found ${users.length} MixerUsers`);
    users.forEach(async (profile) => {
      console.log(`Creating Mixer Client for ${profile.user.username}`);
      const client = await this.getMixerClient(profile);
      console.log(`Refreshing Tokens for ${profile.user.username}`);
      await this.refresh(client, profile);
      console.log(`Connecting to Chat for ${profile.user.username}`);
      await this.connect(client, profile);
    });
  },
};

module.exports = Mixer;
