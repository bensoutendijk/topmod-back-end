const express = require('express');

const router = express.Router();

router.use('/paypal', require('./PayPalRoutes'));
router.use('/donation', require('./DonationRoutes'));

module.exports = router;
