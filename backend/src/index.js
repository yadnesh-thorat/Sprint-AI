require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const requireAuth = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 8080;

// Handle Prisma BigInt serialization
BigInt.prototype.toJSON = function() {
  return this.toString();
};

app.use(cors());
app.use(express.json());

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Catch-all for SPA Routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`AutoSprint server running on port ${PORT}`);
});
