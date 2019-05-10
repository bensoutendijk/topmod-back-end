const passport = require('passport');
const router = require('express').Router();

router.get('/login',
  passport.authenticate('mixer'));

router.get('/callback',
  passport.authenticate('mixer', { failureRedirect: '/login' }), (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

module.exports = router;
