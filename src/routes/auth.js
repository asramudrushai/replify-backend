const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO businesses (name, email, password_hash) VALUES ('${name}', '${email}', '${hashedPassword}')`;
    db.query(sql);
    
    // Get the created business to return ID
    const result = db.query(`SELECT id FROM businesses WHERE email = '${email}'`);
    const businessId = result[0].id;

    const token = jwt.sign({ businessId }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, businessId });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = db.query(`SELECT * FROM businesses WHERE email = '${email}'`);
    const business = result[0];

    if (!business || !(await bcrypt.compare(password, business.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ businessId: business.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, businessId: business.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
