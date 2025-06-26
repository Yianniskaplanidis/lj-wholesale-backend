const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const wholesaleRoutes = require('./routes/wholesale');

<<<<<<< HEAD
dotenv.config(); // Load environment variables from .env

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/wholesale', wholesaleRoutes);

// Health check route
=======
// ✅ Load environment variables from .env
dotenv.config();

// ✅ Create Express app
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Mount wholesale routes
app.use('/wholesale', wholesaleRoutes);

// ✅ Health check route
>>>>>>> 1dbe1e6 (Initial commit with updated styled email)
app.get('/ping', (req, res) => {
  res.send('✅ Wholesale backend is running.');
});

<<<<<<< HEAD
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
=======
// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
>>>>>>> 1dbe1e6 (Initial commit with updated styled email)
});
