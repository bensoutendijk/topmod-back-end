const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/alerts', require('./alerts'));

module.exports = router;
