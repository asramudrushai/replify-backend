const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/faqs - Get all FAQs for the business
router.get('/', authMiddleware, (req, res) => {
  try {
    const faqs = db.query(`SELECT * FROM faqs WHERE business_id = ${req.businessId}`);
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/faqs - Create a new FAQ
router.post('/', authMiddleware, (req, res) => {
  const { question, answer, keywords } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required.' });
  }

  try {
    const sql = `INSERT INTO faqs (business_id, question, answer, keywords) VALUES (${req.businessId}, '${question}', '${answer}', '${keywords || ''}')`;
    db.query(sql);
    res.status(201).json({ message: 'FAQ created successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/faqs/:id
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    db.query(`DELETE FROM faqs WHERE id = ${req.params.id} AND business_id = ${req.businessId}`);
    res.json({ message: 'FAQ deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
