const router = require('express').Router();

router.post('/', (req, res) => {
  console.log(req);
  console.log(req.query);
  console.log(req.params);
  res.send(req.params);
});

module.exports = router;
