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
  const html = DEMO_TEMPLATE.replace(/const backendUrl = 'http:\/\/localhost:3001';/g, "const backendUrl = '" + BASE_URL + "';");
  res.type('html').send(html);
});
// Serve widget test page at root /
app.get('/', (req, res) => {
  const widgetIndex = path.join(WIDGET_DIR, 'index.html');
  if (!fs.existsSync(widgetIndex)) {
    return res.status(200).send('<h1>Replify</h1><p>AI chatbots for local businesses. Widget coming soon — API is running fine. Try <a href="/health">/health</a>.</p>');
  }
  res.sendFile(widgetIndex);
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
