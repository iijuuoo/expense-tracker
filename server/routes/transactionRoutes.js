const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');
const { getDBMode } = require('../config/db');

// Apply protect middleware to all transaction routes
router.use(protect);

// @desc    Get all transactions (with filters, sorting & search)
// @route   GET /api/transactions
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { type, category, startDate, endDate, search } = req.query;

    // Build the query object
    let query = { userId: req.user._id };

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    // Handle Date Ranges
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = getDBMode() === 'mongo' 
          ? new Date(startDate) 
          : new Date(startDate).toISOString();
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.date.$lte = getDBMode() === 'mongo' 
          ? endOfDay 
          : endOfDay.toISOString();
      }
    }

    // Handle Text Search (matches title or description case-insensitively)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch transactions
    const transactions = await Transaction.find(query);

    // Sort in JavaScript (descending by date)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(transactions);
  } catch (error) {
    console.error('Fetch Transactions Error:', error.message);
    res.status(500).json({ message: 'Server error fetching transactions', error: error.message });
  }
});

// @desc    Add a transaction
// @route   POST /api/transactions
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    if (!title || !amount || !type || !category || !date) {
      return res.status(400).json({ message: 'Please provide all required fields: title, amount, type, category, date' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "income" or "expense"' });
    }

    const dateVal = getDBMode() === 'mongo' 
      ? new Date(date) 
      : new Date(date).toISOString();

    const transaction = await Transaction.create({
      userId: req.user._id,
      title,
      amount: Number(amount),
      type,
      category,
      date: dateVal,
      description: description || ''
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Add Transaction Error:', error.message);
    res.status(500).json({ message: 'Server error creating transaction', error: error.message });
  }
});

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    if (getDBMode() === 'mongo' && !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid transaction ID format' });
    }

    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify ownership
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to modify this transaction' });
    }

    // Prepare update object
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (amount !== undefined) updateData.amount = Number(amount);
    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Type must be either "income" or "expense"' });
      }
      updateData.type = type;
    }
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) {
      updateData.date = getDBMode() === 'mongo' 
        ? new Date(date) 
        : new Date(date).toISOString();
    }
    if (description !== undefined) updateData.description = description;

    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, updateData);

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update Transaction Error:', error.message);
    res.status(500).json({ message: 'Server error updating transaction', error: error.message });
  }
});

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    if (getDBMode() === 'mongo' && !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid transaction ID format' });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify ownership
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this transaction' });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ message: 'Transaction removed successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete Transaction Error:', error.message);
    res.status(500).json({ message: 'Server error deleting transaction', error: error.message });
  }
});

// @desc    Get monthly overview summary (Total income, Total expenses, Remaining balance)
// @route   GET /api/summary/overview
// @access  Private
router.get('/summary/overview', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
      }
    });

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length
    });
  } catch (error) {
    console.error('Overview Summary Error:', error.message);
    res.status(500).json({ message: 'Server error fetching overview summary', error: error.message });
  }
});

// @desc    Get monthly report comparison (past 6 months)
// @route   GET /api/summary/monthly
// @access  Private
router.get('/summary/monthly', async (req, res) => {
  try {
    // Generate past 6 months dynamically (ordered chronological, e.g. Jan -> Jun)
    const monthsList = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      monthsList.push({
        month: monthName,
        year: year,
        key: `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        income: 0,
        expense: 0
      });
    }

    const transactions = await Transaction.find({ userId: req.user._id });

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const tKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthObj = monthsList.find(m => m.key === tKey);
      if (monthObj) {
        if (t.type === 'income') {
          monthObj.income += t.amount;
        } else if (t.type === 'expense') {
          monthObj.expense += t.amount;
        }
      }
    });

    res.json(monthsList);
  } catch (error) {
    console.error('Monthly Summary Error:', error.message);
    res.status(500).json({ message: 'Server error fetching monthly summary', error: error.message });
  }
});

// @desc    Get category breakdown of expenses
// @route   GET /api/summary/category
// @access  Private
router.get('/summary/category', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id });

    const categoryMap = {};

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const cat = t.category || 'Others';
        categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      }
    });

    const categoryData = Object.keys(categoryMap).map(cat => ({
      category: cat,
      amount: categoryMap[cat]
    }));

    // Sort by amount descending
    categoryData.sort((a, b) => b.amount - a.amount);

    res.json(categoryData);
  } catch (error) {
    console.error('Category Summary Error:', error.message);
    res.status(500).json({ message: 'Server error fetching category summary', error: error.message });
  }
});

module.exports = router;
