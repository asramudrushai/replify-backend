require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const faqRoutes = require('./routes/faqs');
const chatRoutes = require('./routes/chat');
const leadRoutes = require('./routes/leads');
const businessRoutes = require('./routes/business');
const app = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || 'http://localhost:' + PORT;
app.use(cors());
app.use(express.json());
// Serve widget files at /widget/*
const WIDGET_DIR = path.resolve(__dirname, '../frontend/widget');
app.use('/widget', express.static(WIDGET_DIR));
// Serve self-contained demo page (generates HTML on-the-fly with correct BASE_URL)
let DEMO_TEMPLATE = null;
try {
  DEMO_TEMPLATE = fs.readFileSync(path.join(__dirname, '../frontend/test-page.html'), 'utf8');
} catch (err) {
  console.warn('Demo page not found — /demo route disabled.');
}
app.get('/demo', (req, res) => {
  if (!DEMO_TEMPLATE) {
    return res.status(200).send('<h1>Replify</h1><p>Demo page coming soon. API is running fine — try <a href="/health">/health</a>.</p>');
  }
  const businessId = parseInt(req.query.business, 10) || 1;
  let html = DEMO_TEMPLATE.replace(/const backendUrl = 'http:\/\/localhost:3001';/g, "const backendUrl = '" + BASE_URL + "';");
  html = html.replace(/const businessId = 1;/g, 'const businessId = ' + businessId + ';');

  // Client-branded version (any business other than the Replify demo)
  if (businessId !== 1) {
    const clients = {
      2: {
        name: 'Stable View',
        subtitle: 'Your AI assistant — answering customer questions 24/7',
        q1: 'Are you dog friendly?',
        q2: 'Do you do afternoon tea?'
      }
    };
    const client = clients[businessId];
    if (client) {
      html = html.replace('Replify Chat Widget', client.name + ' Chat Widget');
      html = html.replace('AI-powered customer service chatbot for small businesses', client.subtitle);
      html = html.replace('What are your opening hours?', client.q1);
      html = html.replace('What services do you offer?', client.q2);
      html = html.replace('<h3>Replify Assistant</h3>', '<h3>' + client.name + ' Assistant</h3>');
      // Swap the pricing banner for a subtle "powered by" line
      html = html.replace(/<div class="cta">[\s\S]*?<\/div>/, '<p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;">Powered by <a href="https://replify-backend.onrender.com/demo" style="color:#4f46e5;text-decoration:none;">Replify.uk</a></p>');
    }
  }

  res.type('html').send(html);
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/business', businessRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', baseUrl: BASE_URL });
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (BASE_URL=${BASE_URL})`);
});
