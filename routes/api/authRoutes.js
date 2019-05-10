const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');

const User = mongoose.model('User');

// POST new user route (optional, everyone has access)
router.post('/', auth.optional, async (req, res) => {
  const { body: { user } } = req;

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  if (!user.passwordConfirmation) {
    return res.status(422).json({
      errors: {
        passwordConfirmation: 'is required',
      },
    });
  }

  if (user.password !== user.passwordConfirmation) {
    return res.status(442).json({
      errors: {
        passwordConfirmation: 'does not match',
      },
    });
  }

  const existingUser = await User.findOne({ email: user.email });

  if (!existingUser) {
    const finalUser = new User(user);

    finalUser.setPassword(user.password);
    try {
      await finalUser.save();
    } catch (err) {
      return res.json({
        errors: {
          user: 'Something went wrong',
        },
      });
    }
    res.cookie('token', `Token ${finalUser.generateHttpOnlyJWT()}`, {
      expires: new Date(Date.now() + 1000 * 60 * 30),
      httpOnly: true,
    });
    res.cookie('token2', `Token ${finalUser.generateJWT()}`, {
      expires: new Date(Date.now() + 1000 * 60 * 30),
    });
    return res.json({ user: finalUser.toJSON() });
  }
  return res.status(442).json({
    errors: {
      email: 'already exists',
    },
  });
});

// POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      res.cookie('token', `Token ${passportUser.generateHttpOnlyJWT()}`, {
        expires: new Date(Date.now() + 1000 * 60 * 30),
        httpOnly: true,
      });
      res.cookie('token2', `Token ${passportUser.generateJWT()}`, {
        expires: new Date(Date.now() + 1000 * 60 * 30),
      });
      return res.json({ user: passportUser.toJSON() });
    }

    return res.status(400).json({
      errors: {
        authentication: 'failure',
      },
    });
  })(req, res, next);
});

// GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res) => {
  const { payload: { _id } } = req;

  return User.findById(_id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(400);
      }
      res.cookie('token', `Token ${user.generateHttpOnlyJWT()}`, {
        expires: new Date(Date.now() + 1000 * 60 * 30),
        httpOnly: true,
      });
      res.cookie('token2', `Token ${user.generateJWT()}`, {
        expires: new Date(Date.now() + 1000 * 60 * 30),
      });
      return res.json({ user: user.toJSON() });
    });
});

module.exports = router;
