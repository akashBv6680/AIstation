'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const { login, me } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../middleware/error.middleware');

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
    validate,
  ],
  asyncHandler(login)
);

router.get('/me', authenticate, asyncHandler(me));

module.exports = router;
