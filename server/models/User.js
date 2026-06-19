const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getDBMode } = require('../config/db');
const dbStore = require('./dbStore');

// 1. Mongoose Schema for MongoDB Mode
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving in MongoDB mode
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method on Mongoose documents
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const MongoUserModel = mongoose.model('User', UserSchema);

// 2. Unified User Interface
const User = {
  create: async (userData) => {
    if (getDBMode() === 'mongo') {
      const newUser = new MongoUserModel(userData);
      const savedUser = await newUser.save();
      // Convert to object and clean password
      const obj = savedUser.toObject();
      delete obj.password;
      return obj;
    } else {
      // JSON Mode
      // Check if user already exists
      const existing = await dbStore.findOne('users', { email: userData.email.toLowerCase() });
      if (existing) {
        throw new Error('User already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const record = await dbStore.create('users', {
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: hashedPassword
      });

      const obj = { ...record };
      delete obj.password;
      return obj;
    }
  },

  findOne: async (query) => {
    // Standardize query email
    if (query.email) {
      query.email = query.email.toLowerCase();
    }

    if (getDBMode() === 'mongo') {
      const user = await MongoUserModel.findOne(query);
      return user; // Mongoose document has comparePassword attached
    } else {
      const user = await dbStore.findOne('users', query);
      if (user) {
        // Attach comparePassword to mock user object
        user.comparePassword = async function (candidatePassword) {
          return bcrypt.compare(candidatePassword, this.password);
        };
      }
      return user;
    }
  },

  findById: async (id) => {
    if (getDBMode() === 'mongo') {
      const user = await MongoUserModel.findById(id).select('-password');
      return user;
    } else {
      const user = await dbStore.findById('users', id);
      if (user) {
        const obj = { ...user };
        delete obj.password;
        return obj;
      }
      return null;
    }
  }
};

module.exports = User;
