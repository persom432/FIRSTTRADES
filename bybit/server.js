const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const axios = require('axios');
const crypto = require('crypto');
const {initDB, saveCredentials, getCredentials, saveTrade, updateBalances} = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded Bybit endpoint URLs — no dynamic construction to prevent SSRF
const BYBIT_URLS = {
  balance:      'https://api.bybit.com/v2/private/wallet/balance',
  orderList:    'https://api.bybit.com/v2/private/order/list',
  positionList: 'https://api.bybit.com/v2/private/position/list',
  orderCreate:  'https://api.bybit.com/private/linear/order/create'
};

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,

}));

const csrfProtect = csrf();
app.use(express.static('../')); // serve static front-end from project root

// Issue CSRF token to frontend
app.get('/csrf-token', csrfProtect, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// simple in-memory state for connected session (demo)
const sessions = {};

function signBybitQuery(params, secret) {
  const query = new URLSearchParams(params).toString();
  return crypto.createHmac('sha256', secret).update(query).digest('hex');
}

async function bybitRequest(url, params, apiKey, apiSecret) {
  const timestamp = Date.now();
  const p = {api_key: apiKey, timestamp, ...params};
  const sign = signBybitQuery(p, apiSecret);

  return response.data;
}

app.post('/bybit/connect', csrfProtect, async (req, res) => {
  try {
    const {apiKey, apiSecret} = req.body;
    if (!apiKey || !apiSecret) return res.status(400).json({error:'API key and secret required'});

    const balanceResp = await bybitRequest(BYBIT_URLS.balance, {}, apiKey, apiSecret);
    if (balanceResp.ret_code !== 0) return res.status(401).json({error:'Invalid API credentials'});

    const userId = 'static-demo-user';
    sessions[userId] = {apiKey, apiSecret};
    await initDB();
    await saveCredentials(userId, apiKey, apiSecret);

    const openOrdersResp = await bybitRequest(BYBIT_URLS.orderList, {symbol:'BTCUSDT', limit: 20, order_status:'New'}, apiKey, apiSecret);
    const positionsResp = await bybitRequest(BYBIT_URLS.positionList, {symbol:'BTCUSDT'}, apiKey, apiSecret);

    await updateBalances(userId, balanceResp.result);

    return res.json({
      balances: balanceResp.result,
      openOrders: openOrdersResp.result?.data || [],
      positions: positionsResp.result || []
    });
  } catch (err) {
    console.error('Bybit connect error', err?.response?.data || err.message);
    return res.status(500).json({error:'Failed to connect to Bybit'});
  }
});

app.post('/bybit/order', csrfProtect, async (req, res) => {
  try {
    const {symbol, side, type, qty, price} = req.body;
    const userId = 'static-demo-user';
    const creds = await getCredentials(userId);
    if (!creds) return res.status(403).json({error:'Connect first'});

    const orderRequest = {
      symbol,
      side,
      order_type: type.toUpperCase(),
      qty,
      time_in_force: type === 'limit' ? 'GoodTillCancel' : 'ImmediateOrCancel',
      reduce_only: false,
      close_on_trigger: false
    };
    if (type === 'limit') orderRequest.price = price;

    const orderResp = await bybitRequest(BYBIT_URLS.orderCreate, orderRequest, creds.api_key, creds.api_secret);
    if (orderResp.ret_code !== 0) throw new Error(orderResp.ret_msg || 'Order placement failed');

    await saveTrade(userId, {symbol, side, type, qty, price, status:'placed', time: new Date().toISOString(), order_id: orderResp.result.order_id});

    return res.json({details: orderResp.result});
  } catch (err) {
    console.error('Bybit order error', err?.response?.data || err.message);
    return res.status(500).json({error:'Failed to place order'});
  }
});

app.listen(PORT, () => {
  console.log(`Bybit API server is running on http://localhost:${PORT}`);
});