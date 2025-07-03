const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const wholesaleRoutes = require('./routes/wholesale');

// Load environment variables from .env
dotenv.config();

// Create Express app
const app = express();

// Enable CORS (you can configure origins here if needed)
app.use(cors({
  origin: 'https://www.littlejoy.com.au', // your live Shopify domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Health check endpoint
app.get('/ping', (req, res) => {
  res.send('✅ Wholesale backend is running.');
});

// Mount wholesale routes at /api
app.use('/api', wholesaleRoutes);

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
