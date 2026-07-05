const express = require('express');
const db = require('../db');
const { matchFaq } = require('../utils/faqMatcher');

const router = express.Router();

// GET /api/chat/:businessId/answer?question=...
router.get('/:businessId/answer', (req, res) => {
  const { businessId } = req.params;
  const { question } = req.query;

  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  try {
    const faqs = db.query(`SELECT * FROM faqs WHERE business_id = ${businessId}`);
    const match = matchFaq(question, faqs);

    if (match) {
      res.json({ answer: match.answer });
    } else {
      res.json({ answer: "I'm sorry, I don't have an answer for that. Would you like to leave your details and have someone get back to you?" });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/chat/session
router.post('/session', (req, res) => {
  const { businessId, widgetId } = req.body;

  if (!businessId) {
    return res.status(400).json({ error: 'Business ID is required.' });
  }

  try {
    db.query(`INSERT INTO chat_sessions (business_id, widget_id) VALUES (${businessId}, '${widgetId || ''}')`);
    const result = db.query(`SELECT id FROM chat_sessions ORDER BY id DESC LIMIT 1`);
    res.status(201).json({ sessionId: result[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
