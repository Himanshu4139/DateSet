const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/orderPayment', paymentController.orderPayment);
router.post('/orderValidate', paymentController.orderValidate);

module.exports = router;
