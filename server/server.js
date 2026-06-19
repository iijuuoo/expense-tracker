require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for local development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Database Connection
connectDB().then(({ mode }) => {
  console.log(`Database initialized in "${mode}" mode.`);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Route adapter to support requested GET /api/summary/monthly and GET /api/summary/category
app.use('/api/summary', (req, res, next) => {
  // Rewrite subpath /monthly or /category to match routes defined in transactionRoutes
  req.url = '/summary' + req.url;
  transactionRoutes(req, res, next);
});

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running' });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
