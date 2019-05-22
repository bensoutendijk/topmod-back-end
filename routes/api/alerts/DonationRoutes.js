const router = require('express').Router();

router.post('/', (req, res) => {
  req.app.io.emit('alert', req.body);
  res.status(200).send(req.body);
});

module.exports = router;
