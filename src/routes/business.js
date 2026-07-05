const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/business/profile
router.get('/profile', authMiddleware, (req, res) => {
  try {
    const result = db.query(`SELECT id, name, email, created_at FROM businesses WHERE id = ${req.businessId}`);
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/business/profile
router.post('/profile', authMiddleware, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required.' });

  try {
    db.query(`UPDATE businesses SET name = '${name}' WHERE id = ${req.businessId}`);
    res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
