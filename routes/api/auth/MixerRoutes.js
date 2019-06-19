const passport = require('passport');
const router = require('express').Router();

router.get('/login',
  passport.authenticate('mixer', {
    scope: [
      'chat:connect',
      'chat:chat',
      'chat:change_ban',
      'chat:change_role',
      'chat:timeout',
      'chat:remove_message',
      'chat:purge',
      'chat:view_deleted',
      'chat:bypass_links',
      'chat:bypass_slowchat',
      'channel:analytics:self',
      'channel:details:self',
      'user:details:self',
      'user:analytics:self',
      'channel:update:self',
    ],
  }));

router.get('/callback',
  passport.authenticate('mixer', { failureRedirect: '/login' }), (req, res) => {
    console.log(req.user);
    // Successful authentication, redirect home.
    res.redirect('/');
  });

router.get('/current', (req, res) => {
  res.send({
    _id: 123,
  });
});

module.exports = router;
