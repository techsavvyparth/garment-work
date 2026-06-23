// Simple JSON file database - no MongoDB needed for demo!
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_FILE = path.join(__dirname, '../data/db.json');

// Ensure data directory and file exist
const ensureDB = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
      users: [], ladies: [], works: [], payments: []
    }, null, 2));
  }
};

const readDB = () => {
  ensureDB();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const writeDB = (data) => {
  ensureDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Generic collection operations
const collection = (name) => ({
  find: (query = {}) => {
    const db = readDB();
    let results = db[name] || [];
    Object.entries(query).forEach(([key, val]) => {
      if (val === undefined || val === null) return;
      if (typeof val === 'object' && val.$regex) {
        results = results.filter(r => new RegExp(val.$regex, val.$options || '').test(r[key]));
      } else {
        results = results.filter(r => String(r[key]) === String(val));
      }
    });
    return results;
  },
  findById: (id) => {
    const db = readDB();
    return (db[name] || []).find(r => r._id === id) || null;
  },
  findOne: (query = {}) => {
    const db = readDB();
    let results = db[name] || [];
    for (const [key, val] of Object.entries(query)) {
      results = results.filter(r => String(r[key]) === String(val));
    }
    return results[0] || null;
  },
  create: (data) => {
    const db = readDB();
    const now = new Date().toISOString();
    const newDoc = { _id: uuidv4(), ...data, createdAt: now, updatedAt: now };
    db[name] = db[name] || [];
    db[name].push(newDoc);
    writeDB(db);
    return newDoc;
  },
  updateById: (id, data) => {
    const db = readDB();
    const idx = (db[name] || []).findIndex(r => r._id === id);
    if (idx === -1) return null;
    db[name][idx] = { ...db[name][idx], ...data, updatedAt: new Date().toISOString() };
    writeDB(db);
    return db[name][idx];
  },
  deleteById: (id) => {
    const db = readDB();
    const idx = (db[name] || []).findIndex(r => r._id === id);
    if (idx === -1) return null;
    const deleted = db[name][idx];
    db[name].splice(idx, 1);
    writeDB(db);
    return deleted;
  },
  deleteMany: (query = {}) => {
    const db = readDB();
    const before = (db[name] || []).length;
    db[name] = (db[name] || []).filter(r => {
      for (const [key, val] of Object.entries(query)) {
        if (String(r[key]) === String(val)) return false;
      }
      return true;
    });
    writeDB(db);
    return before - db[name].length;
  },
  count: (query = {}) => collection(name).find(query).length,
  distinct: (field, query = {}) => {
    const results = collection(name).find(query);
    return [...new Set(results.map(r => r[field]).filter(Boolean))];
  },
});

module.exports = { collection, readDB, writeDB };
