'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = signToken(user._id);
  return res.json({ success: true, token, user: user.toSafeObject() });
}

async function me(req, res) {
  return res.json({ success: true, user: { id: req.user._id, email: req.user.email, role: req.user.role } });
}

module.exports = { login, me };
