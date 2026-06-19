const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'data', 'store.json');

// Ensure data folder exists
const ensureStoreExists = () => {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify({ users: [], transactions: [] }, null, 2), 'utf8');
  }
};

const readStore = () => {
  ensureStoreExists();
  try {
    const data = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON store:', error);
    return { users: [], transactions: [] };
  }
};

const writeStore = (data) => {
  ensureStoreExists();
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing JSON store:', error);
  }
};

// Generate a unique ID similar to MongoDB ObjectId
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Match record helper mimicking MongoDB query operators
const matchRecord = (record, query) => {
  for (const key in query) {
    if (key === '$or') {
      const conditions = query[key];
      const matchesAny = conditions.some(cond => matchRecord(record, cond));
      if (!matchesAny) return false;
      continue;
    }

    const val = query[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const target = record[key];
      for (const op in val) {
        const opVal = val[op];
        if (op === '$gte') {
          if (target < opVal) return false;
        } else if (op === '$lte') {
          if (target > opVal) return false;
        } else if (op === '$gt') {
          if (target <= opVal) return false;
        } else if (op === '$lt') {
          if (target >= opVal) return false;
        } else if (op === '$regex') {
          const regex = new RegExp(opVal, val.$options || '');
          if (!regex.test(target || '')) return false;
        } else if (op === '$options') {
          continue; // options are read inside $regex
        } else {
          // Fallback simple equality for unknown operators
          if (target !== opVal) return false;
        }
      }
    } else {
      // Direct value match
      if (record[key] !== val) return false;
    }
  }
  return true;
};

// Public Mock Query API
const dbStore = {
  find: async (collection, query = {}) => {
    const store = readStore();
    const list = store[collection] || [];
    return list.filter(item => matchRecord(item, query));
  },

  findOne: async (collection, query = {}) => {
    const store = readStore();
    const list = store[collection] || [];
    const item = list.find(item => matchRecord(item, query));
    return item || null;
  },

  findById: async (collection, id) => {
    const store = readStore();
    const list = store[collection] || [];
    const item = list.find(item => item._id === id);
    return item || null;
  },

  create: async (collection, data) => {
    const store = readStore();
    const list = store[collection] || [];
    
    const newRecord = {
      _id: generateId(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    list.push(newRecord);
    store[collection] = list;
    writeStore(store);
    return newRecord;
  },

  findByIdAndUpdate: async (collection, id, updateData) => {
    const store = readStore();
    const list = store[collection] || [];
    const index = list.findIndex(item => item._id === id);
    
    if (index === -1) return null;
    
    const updatedRecord = {
      ...list[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    list[index] = updatedRecord;
    store[collection] = list;
    writeStore(store);
    return updatedRecord;
  },

  findByIdAndDelete: async (collection, id) => {
    const store = readStore();
    const list = store[collection] || [];
    const index = list.findIndex(item => item._id === id);
    
    if (index === -1) return null;
    
    const deletedRecord = list[index];
    list.splice(index, 1);
    store[collection] = list;
    writeStore(store);
    return deletedRecord;
  }
};

module.exports = dbStore;
