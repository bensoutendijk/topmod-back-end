const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/notifications', require('./notifications'));

module.exports = router;
