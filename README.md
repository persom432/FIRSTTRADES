# FIRSTTRADES - Online Trading Platform

A full-featured online trading platform with account registration, deposit management, live trading charts, and an admin panel.

## Pages

| File | Description |
|------|-------------|
| `broker.html` | Homepage / Landing page |
| `getstarted.html` | Account type selection |
| `step2.html` | User registration |
| `step3.html` | Account verification |
| `step5.html` | Fund wallet (BTC / ETH deposit) |
| `step6.html` | Welcome / platform intro |
| `login.html` | User login |
| `trading-dashboard.html` | Main trading dashboard with live chart |
| `admin.html` | Admin panel for approving deposits |

## Setup

### Frontend only (no server needed)
Just open `broker.html` in a browser. All pages work with `localStorage` for data.

### With backend (Bybit API server)
```bash
npm install
npm start
```
Server runs on `http://localhost:3000`

## Admin Panel
- URL: `admin.html`
- Used to approve or reject user deposits before they appear in account balance

## User Flow
1. Visit `broker.html`
2. Click **Get Started** → choose account type
3. Fill in registration details
4. Verify account
5. Welcome page → fund wallet or start trading
6. Login at `login.html` to access dashboard

## Notes
- Keep `admin.html` URL private
- The `bybit/` folder contains the optional Node.js backend
- All user data is stored in browser `localStorage`
