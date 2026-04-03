const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbFile = path.join(__dirname, 'data', 'bybit.db');

function ensureDataFolder() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
}

function openDB() {
  ensureDataFolder();
  return new sqlite3.Database(dbFile);
}

async function initDB() {
  const db = openDB();
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS bybit_credentials (user_id TEXT PRIMARY KEY, api_key TEXT, api_secret TEXT, created_at TEXT)`);
      db.run(`CREATE TABLE IF NOT EXISTS bybit_trades (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, symbol TEXT, side TEXT, type TEXT, qty REAL, price REAL, status TEXT, order_id TEXT, created_at TEXT)`);
      db.run(`CREATE TABLE IF NOT EXISTS bybit_balances (user_id TEXT, currency TEXT, available REAL, locked REAL, updated_at TEXT, PRIMARY KEY (user_id,currency))`);
      resolve();
    });
  });
  db.close();
}

function saveCredentials(userId, apiKey, apiSecret) {
  const db = openDB();
  const stmt = db.prepare(`INSERT OR REPLACE INTO bybit_credentials (user_id, api_key, api_secret, created_at) VALUES (?, ?, ?, ?)`);
  stmt.run(userId, apiKey, apiSecret, new Date().toISOString());
  stmt.finalize();
  db.close();
}

function getCredentials(userId) {
  return new Promise((resolve, reject) => {
    const db = openDB();
    db.get(`SELECT user_id AS userId, api_key AS apiKey, api_secret AS apiSecret FROM bybit_credentials WHERE user_id = ?`, [userId], (err, row) => {
      db.close();
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function saveTrade(userId, trade) {
  const db = openDB();
  const stmt = db.prepare(`INSERT INTO bybit_trades (user_id, symbol, side, type, qty, price, status, order_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(userId, trade.symbol, trade.side, trade.type, trade.qty, trade.price || null, trade.status, trade.order_id || null, new Date().toISOString());
  stmt.finalize();
  db.close();
}

function updateBalances(userId, balances) {
  const db = openDB();
  const stmt = db.prepare(`INSERT OR REPLACE INTO bybit_balances (user_id, currency, available, locked, updated_at) VALUES (?, ?, ?, ?, ?)`);
  Object.entries(balances).forEach(([currency,data]) => {
    stmt.run(userId, currency, parseFloat(data.available || 0), parseFloat(data.locked || 0), new Date().toISOString());
  });
  stmt.finalize();
  db.close();
}

module.exports = { initDB, saveCredentials, getCredentials, saveTrade, updateBalances };