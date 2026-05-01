'use strict';

const Contact = require('../models/Contact.model');
const emailService = require('../services/email.service');

async function submit(req, res) {
  const { name, email, phone, message, interest } = req.body;

  const contact = await Contact.create({ name, email, phone, message, interest });

  // Fire-and-forget email notifications
  emailService.sendContactNotification({ name, email, phone, message, interest }).catch((err) =>
    console.warn('Contact email failed:', err.message)
  );
  emailService.sendContactAck({ name, email }).catch((err) =>
    console.warn('Contact ack email failed:', err.message)
  );

  return res.status(201).json({
    success: true,
    message: "Thanks! We'll be in touch within 24 hours.",
    id: contact._id,
  });
}

module.exports = { submit };
