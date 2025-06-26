const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const wholesaleRoutes = require('./routes/wholesale');

// ✅ Load environment variables from .env
dotenv.config();

// ✅ Create Express app
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Health check route
app.get('/ping', (req, res) => {
  res.send('✅ Wholesale backend is running.');
});

// ✅ Mount wholesale routes
app.use('/wholesale', wholesaleRoutes);

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
