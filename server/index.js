require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Register API routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const budgetRoutes = require('./routes/budgets');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);

// SPA fallback – serve index.html for any non‑API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start server after DB connection
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to database. Server not started.', err);
    process.exit(1);
  });
