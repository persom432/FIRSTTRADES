const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const dataFile = path.join(__dirname, 'transactions.json');
const tradesFile = path.join(__dirname, 'trades.json');

function ensureDataFile() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]', 'utf8');
  }
}

function readTransactions() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (error) {
    throw new Error('Unable to read transactions data.');
  }
}

function writeTransactions(transactions) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(transactions, null, 2), 'utf8');
  } catch (error) {
    throw new Error('Unable to save transactions data.');
  }
}

function createTransactionId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

function ensureTradesFile() {
  if (!fs.existsSync(tradesFile)) {
    fs.writeFileSync(tradesFile, '[]', 'utf8');
  }
}

function readTrades() {
  ensureTradesFile();
  try {
    const raw = fs.readFileSync(tradesFile, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (error) {
    throw new Error('Unable to read trades data.');
  }
}

function writeTrades(trades) {
  try {
    fs.writeFileSync(tradesFile, JSON.stringify(trades, null, 2), 'utf8');
  } catch (error) {
    throw new Error('Unable to save trades data.');
  }
}

function getUserBalance(userId) {
  const transactions = readTransactions();
  const approved = transactions.filter(t => t.userId === userId && t.status === 'approved');
  let balance = 0;
  approved.forEach(tx => {
    if (tx.type === 'deposit') balance += tx.amount;
    else if (tx.type === 'withdrawal') balance -= tx.amount;
  });
  return Math.max(0, balance);
}

function calculateProfitChance(isAI) {
  if (isAI) {
    return Math.random() < 0.75;
  } else {
    return Math.random() < 0.15;
  }
}

function calculateProfit(amount, isAI) {
  const isSuccessful = calculateProfitChance(isAI);
  if (isSuccessful) {
    if (isAI) {
      const profit = amount * (Math.random() * 0.30);
      return Math.round(profit * 100) / 100;
    } else {
      const profit = amount * (Math.random() * 0.15);
      return Math.round(profit * 100) / 100;
    }
  }
  return -amount;
}

app.post('/transaction', (req, res, next) => {
  try {
    const { userId, amount, type } = req.body;

    if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
      return res.status(400).json({ error: 'userId is required and must be a string or number.' });
    }

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'amount is required and must be a positive number.' });
    }

    if (type !== 'deposit' && type !== 'withdrawal') {
      return res.status(400).json({ error: 'type must be either "deposit" or "withdrawal".' });
    }

    const transaction = {
      id: createTransactionId(),
      userId: typeof userId === 'number' ? String(userId) : userId.trim(),
      type,
      amount: parsedAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const transactions = readTransactions();
    transactions.push(transaction);
    writeTransactions(transactions);

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

app.get('/admin/transactions', (req, res, next) => {
  try {
    const transactions = readTransactions();
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

app.patch('/transaction/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ error: 'status must be either "approved" or "rejected".' });
    }

    const transactions = readTransactions();
    const index = transactions.findIndex((tx) => tx.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    transactions[index].status = status;
    writeTransactions(transactions);

    res.json(transactions[index]);
  } catch (error) {
    next(error);
  }
});

// Trading endpoints
app.post('/trade/open', (req, res, next) => {
  try {
    const { userId, amount, isAI } = req.body;

    if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
      return res.status(400).json({ error: 'userId is required and must be a string or number.' });
    }

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'amount is required and must be a positive number.' });
    }

    const balance = getUserBalance(String(userId));
    if (balance < parsedAmount) {
      return res.status(400).json({ error: 'Insufficient balance to open trade.' });
    }

    const trade = {
      id: createTransactionId(),
      userId: String(userId),
      amount: parsedAmount,
      isAI: isAI === true,
      status: 'open',
      profit: 0,
      profitPercentage: 0,
      openedAt: new Date().toISOString(),
      closedAt: null,
    };

    const trades = readTrades();
    trades.push(trade);
    writeTrades(trades);

    res.status(201).json(trade);
  } catch (error) {
    next(error);
  }
});

app.post('/trade/close/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const trades = readTrades();
    const tradeIndex = trades.findIndex(t => t.id === id);

    if (tradeIndex === -1) {
      return res.status(404).json({ error: 'Trade not found.' });
    }

    const trade = trades[tradeIndex];
    if (trade.status !== 'open') {
      return res.status(400).json({ error: 'Trade is not open.' });
    }

    const profit = calculateProfit(trade.amount, trade.isAI);
    trade.profit = profit;
    trade.profitPercentage = Math.round((profit / trade.amount) * 100 * 100) / 100;
    trade.status = 'closed';
    trade.closedAt = new Date().toISOString();

    trades[tradeIndex] = trade;
    writeTrades(trades);

    res.json(trade);
  } catch (error) {
    next(error);
  }
});

app.get('/trades/active/:userId', (req, res, next) => {
  try {
    const { userId } = req.params;
    const trades = readTrades();
    const activeTrades = trades.filter(t => t.userId === userId && t.status === 'open');
    res.json(activeTrades);
  } catch (error) {
    next(error);
  }
});

app.get('/trades/history/:userId', (req, res, next) => {
  try {
    const { userId } = req.params;
    const trades = readTrades();
    const history = trades.filter(t => t.userId === userId && t.status === 'closed');
    res.json(history);
  } catch (error) {
    next(error);
  }
});

app.get('/balance/:userId', (req, res, next) => {
  try {
    const { userId } = req.params;
    const balance = getUserBalance(userId);
    res.json({ userId, balance });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = 3000;
app.listen(PORT, () => {
  ensureDataFile();
  console.log(`Transaction server listening on http://localhost:${PORT}`);
});
