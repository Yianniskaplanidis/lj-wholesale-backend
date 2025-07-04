// Load environment variables
require('dotenv').config();
console.log("✅ ENV TEST: EMAIL_HOST =", process.env.EMAIL_HOST);

const express = require('express');
const cors = require('cors');
const wholesaleRoutes = require('./routes/wholesale');

const app = express();

// ✅ Enable CORS for your Shopify domain
app.use(cors({
  origin: 'https://www.littlejoy.com.au',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// ✅ Middleware to parse JSON request bodies
app.use(express.json());

// ✅ Health check route
app.get('/api/ping', (req, res) => {
  res.send('✅ Wholesale backend is running.');
});

// ✅ Mount wholesale routes at /api/*
app.use('/api', wholesaleRoutes);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ Start server on port (default to 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
