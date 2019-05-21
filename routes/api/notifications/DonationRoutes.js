const router = require('express').Router();

router.post('/', (req) => {
  console.log(req.body);
});

module.exports = router;
