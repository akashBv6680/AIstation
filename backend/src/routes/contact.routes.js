'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const { submit } = require('../controllers/contact.controller');
const { validate } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../middleware/error.middleware');

const router = Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    body('interest').optional().isIn(['individual', 'team', 'franchise', 'partnership', 'other']),
    validate,
  ],
  asyncHandler(submit)
);

module.exports = router;
