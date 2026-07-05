const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/leads - Capture a lead
router.post('/', (req, res) => {
  const { businessId, name, email, sessionId } = req.body;

  if (!businessId || !email) {
    return res.status(400).json({ error: 'Business ID and email are required.' });
  }

  try {
    const sql = `INSERT INTO leads (business_id, name, email, chat_session_id) VALUES (${businessId}, '${name || ''}', '${email}', ${sessionId || 'NULL'})`;
    db.query(sql);
    res.status(201).json({ message: 'Lead captured successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/leads - Retrieve leads for a business
router.get('/', authMiddleware, (req, res) => {
  try {
    const leads = db.query(`SELECT * FROM leads WHERE business_id = ${req.businessId} ORDER BY created_at DESC`);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
