const express = require('express');

const router = express.Router();

router.use('/mixer', require('./MixerRoutes'));

module.exports = router;
