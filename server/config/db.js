const mongoose = require('mongoose');

let dbMode = 'json';

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.log('⚠️  MONGO_URI not provided. Falling back to local JSON database storage.');
    dbMode = 'json';
    return { mode: 'json' };
  }

  try {
    // Attempt Mongoose connection
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // Fast timeout if not running
    });
    console.log('✅ Connected to MongoDB via Mongoose.');
    dbMode = 'mongo';
    return { mode: 'mongo' };
  } catch (error) {
    console.error(`⚠️  MongoDB Connection Error: ${error.message}`);
    console.log('🔌 Falling back to local JSON database storage.');
    dbMode = 'json';
    return { mode: 'json' };
  }
};

const getDBMode = () => dbMode;

module.exports = { connectDB, getDBMode };
