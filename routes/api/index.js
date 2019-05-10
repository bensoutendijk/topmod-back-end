const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/projects', require('./projectRoutes'));
router.use('/articles', require('./articleRoutes'));

module.exports = router;
