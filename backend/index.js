const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse application/json
app.use(express.json());

// Simple logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow')
  .then(() => console.log('MongoDB connection established successfully.'))
  .catch(err => {
    console.error('MongoDB database connection failed:', err.message);
    process.exit(1);
  });

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'TaskFlow REST API is active and healthy.' });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ msg: 'Endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
