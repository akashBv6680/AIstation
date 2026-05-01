'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/session.controller');
const { validate } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../middleware/error.middleware');

const router = Router();

// Public — kiosk uses these without staff JWT
router.post(
  '/start',
  [
    body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
    body('workstationId').notEmpty().withMessage('workstationId required'),
    validate,
  ],
  asyncHandler(ctrl.startSession)
);

router.post('/:id/pause', asyncHandler(ctrl.pauseSession));
router.post('/:id/resume', asyncHandler(ctrl.resumeSession));
router.post('/:id/end', asyncHandler(ctrl.endSession));
router.get('/:id/status', asyncHandler(ctrl.sessionStatus));

// Admin — list all sessions
router.get('/', asyncHandler(ctrl.listSessions));

module.exports = router;
