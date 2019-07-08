const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/chat', require('./chat'));
router.use('/analytics', require('./analytics'));
router.use('/alerts', require('./alerts'));

module.exports = router;
