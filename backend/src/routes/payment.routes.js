'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const { createOrder, verifyPayment, getBalance } = require('../controllers/payment.controller');
const { validate } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../middleware/error.middleware');

const router = Router();

router.post(
  '/create-order',
  [
    body('planId').isIn(['starter', 'explorer', 'pro']).withMessage('Invalid plan'),
    body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
    validate,
  ],
  asyncHandler(createOrder)
);

router.post(
  '/verify',
  [
    body('orderId').notEmpty().withMessage('orderId required'),
    body('paymentId').notEmpty().withMessage('paymentId required'),
    body('signature').notEmpty().withMessage('signature required'),
    body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
    validate,
  ],
  asyncHandler(verifyPayment)
);

router.get(
  '/balance/:phone',
  [param('phone').matches(/^\d{10}$/).withMessage('Invalid phone'), validate],
  asyncHandler(getBalance)
);

module.exports = router;
