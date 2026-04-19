const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const dataFile = path.join(__dirname, '..', 'transactions.json');

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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = 3000;
app.listen(PORT, () => {
  ensureDataFile();
  console.log(`Transaction server listening on http://localhost:${PORT}`);
});
