# Bybit Integration Module

## Overview
This module implements the requested Bybit connection flow:
- Prompt API key + secret
- Fetch balances, open orders, positions
- Place buy/sell market and limit orders
- Show balances, market prices, charts
- Backend API key validation, trade recording, periodic sync

## Local structure
- bybit.html - frontend demo interface
- server.js - Express backend API endpoints
- bybit-auth.js - Bybit request signing helper
- db.js - SQLite persistence helpers
- data/ - runtime database files

## Run
1. `npm install express axios sqlite3 crypto body-parser`
2. `node bybit/server.js`
3. Open http://localhost:3000/bybit.html
