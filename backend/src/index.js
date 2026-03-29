require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

// Routes
app.use('/api/auth', authRoutes);

// Protected Core APIs
// Note: If you want /api/upload-srs or /api/project-board to be protected, 
// add the middleware. Since Java's SecurityConfig allowed all temporarily or as needed, 
// we will just not enforce it globally for /api/ unless desired.
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('AutoSprint AI Backend Running on Node.js');
});

app.listen(PORT, () => {
    console.log(`AutoSprint server running on port ${PORT}`);
});
