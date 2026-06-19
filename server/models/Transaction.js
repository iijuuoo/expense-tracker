const mongoose = require('mongoose');
const { getDBMode } = require('../config/db');
const dbStore = require('./dbStore');

// 1. Mongoose Schema for MongoDB Mode
const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MongoTransactionModel = mongoose.model('Transaction', TransactionSchema);

// 2. Unified Transaction Interface
const Transaction = {
  create: async (data) => {
    if (getDBMode() === 'mongo') {
      const newTransaction = new MongoTransactionModel(data);
      return await newTransaction.save();
    } else {
      // JSON Mode
      const record = await dbStore.create('transactions', {
        userId: data.userId,
        title: data.title,
        amount: Number(data.amount),
        type: data.type,
        category: data.category,
        date: data.date, // Stored as ISO string or Date string
        description: data.description || ''
      });
      return record;
    }
  },

  find: async (query) => {
    if (getDBMode() === 'mongo') {
      // MongoDB queries return Mongoose Query builder, we sort in controller
      return await MongoTransactionModel.find(query);
    } else {
      // JSON Mode
      return await dbStore.find('transactions', query);
    }
  },

  findById: async (id) => {
    if (getDBMode() === 'mongo') {
      return await MongoTransactionModel.findById(id);
    } else {
      return await dbStore.findById('transactions', id);
    }
  },

  findByIdAndUpdate: async (id, updateData) => {
    if (getDBMode() === 'mongo') {
      return await MongoTransactionModel.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      if (updateData.amount !== undefined) {
        updateData.amount = Number(updateData.amount);
      }
      return await dbStore.findByIdAndUpdate('transactions', id, updateData);
    }
  },

  findByIdAndDelete: async (id) => {
    if (getDBMode() === 'mongo') {
      return await MongoTransactionModel.findByIdAndDelete(id);
    } else {
      return await dbStore.findByIdAndDelete('transactions', id);
    }
  }
};

module.exports = Transaction;
