'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');

const router = Router();

// All admin routes require valid JWT + admin role
router.use(authenticate, requireAdmin);

router.get('/dashboard', asyncHandler(ctrl.getDashboard));
router.get('/workstations', asyncHandler(ctrl.getWorkstations));
router.post('/workstations/seed', asyncHandler(ctrl.seedWorkstations));
router.get('/transactions', asyncHandler(ctrl.getTransactions));
router.get('/contacts', asyncHandler(ctrl.getContacts));

module.exports = router;
