// Load environment variables
require('dotenv').config();
console.log("✅ ENV TEST: EMAIL_HOST =", process.env.EMAIL_HOST);

const express = require('express');
const cors = require('cors');
const wholesaleRoutes = require('./routes/wholesale');

const app = express();

// Enable CORS
app.use(cors({
  origin: 'https://www.littlejoy.com.au',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Middleware
app.use(express.json());

// Health check
app.get('/ping', (req, res) => {
  res.send('✅ Wholesale backend is running.');
});

// Mount routes
app.use('/api', wholesaleRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
