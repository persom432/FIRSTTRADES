# User Data Collection & Retrieval Guide

## Overview
The FIRSTTRADES platform now includes a comprehensive user data collection and export system. All user information including deposits, trades, payments, and profile data is automatically collected and retrievable.

## Data Collected

### 1. **Profile Information**
- User ID
- Email address
- Full name
- Phone number
- Country
- Account type
- Registration date

### 2. **Deposit Records**
- Deposit ID
- Amount
- Status (pending/approved/rejected)
- Deposit date
- Deposit method (Crypto, Card, etc.)
- Payment proof (file reference)

### 3. **Trade History**
- Trade ID
- Trade amount
- Trade type (AI or Manual)
- Profit/Loss
- Profit percentage
- Trade status (open/closed)
- Open date/time
- Close date/time

### 4. **Withdrawals**
- Withdrawal ID
- Amount
- Status
- Date
- Wallet address

### 5. **Payment Proofs**
- All uploaded payment proofs
- Upload timestamps
- Transaction references

### 6. **Signals Plan**
- Plan name (Starter/Pro/Elite)
- Activation date
- Cost

### 7. **Session History**
- Login timestamps
- Session duration

## How to Access User Data

### Method 1: Browser Console (Client-Side)

Open the browser's Developer Tools (F12) and use the global `userDataCollector` object:

```javascript
// Get a specific user's data
const userId = localStorage.getItem('userId');
userDataCollector.getAllUserData(userId).then(data => {
    console.log(data);
});

// Get analytics summary
userDataCollector.getAnalyticsSummary(userId).then(summary => {
    console.log('Analytics:', summary);
});
```

### Method 2: Export User Data as JSON

```javascript
// Export single user data as JSON
const userId = localStorage.getItem('userId');
userDataCollector.exportAsJSON(userId);
// Downloads: user_data_[userId]_[date].json
```

### Method 3: Export User Data as CSV

```javascript
// Export single user data as CSV
const userId = localStorage.getItem('userId');
userDataCollector.exportAsCSV(userId);
// Downloads: user_data_[userId]_[date].csv
```

### Method 4: Admin - Get All Users Data

```javascript
// Get all users' data (admin function)
userDataCollector.getAllUsersData().then(allUsers => {
    console.log(allUsers);
});

// Export all users data as JSON
userDataCollector.exportAllUsersAsJSON();
// Downloads: all_users_data_[date].json
```

### Method 5: Server-Side (Node.js API)

The API automatically collects data from:

1. **Transactions Endpoint**
   ```bash
   GET http://localhost:3000/admin/transactions
   ```
   Returns all deposits and withdrawals

2. **Trades Endpoints**
   ```bash
   GET http://localhost:3000/trades/active/:userId
   GET http://localhost:3000/trades/history/:userId
   ```
   Returns active and closed trades

3. **Balance Endpoint**
   ```bash
   GET http://localhost:3000/balance/:userId
   ```
   Returns account balance

## Retrieving Payment Proof Images

Payment proofs are stored in localStorage with keys following this pattern:
```
depositProof_[depositId]
paymentProof_[userId]_[index]
```

### Via JavaScript:

```javascript
// Get payment proofs for a user
function getPaymentProofs(userId) {
    const proofs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('paymentProof_' + userId) || key.includes('depositProof_')) {
            proofs.push({
                key: key,
                data: localStorage.getItem(key),
                timestamp: localStorage.getItem(key + '_timestamp')
            });
        }
    }
    return proofs;
}

// Usage
const proofs = getPaymentProofs(userId);
console.log(proofs);
```

## Data Example

```json
{
  "userId": "user_1234567890",
  "timestamp": "2024-04-19T15:30:00Z",
  "profile": {
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "+1-555-0123",
    "country": "United States",
    "accountType": "Premium",
    "registeredAt": "2024-01-15T10:00:00Z"
  },
  "deposits": [
    {
      "id": "1713623400000-a1b2c3d4",
      "amount": 500,
      "status": "approved",
      "createdAt": "2024-04-19T10:00:00Z",
      "method": "Bitcoin",
      "proof": "base64_encoded_image_data_here"
    }
  ],
  "trades": [
    {
      "id": "1713623500000-e5f6g7h8",
      "amount": 100,
      "type": "AI Trading",
      "profit": 22.50,
      "profitPercentage": 22.50,
      "status": "closed",
      "openedAt": "2024-04-19T11:00:00Z",
      "closedAt": "2024-04-19T11:15:00Z"
    }
  ],
  "withdrawals": [],
  "payments": [],
  "signalsPlan": {
    "plan": "Pro",
    "activatedAt": "2024-04-18T14:30:00Z",
    "cost": "300"
  }
}
```

## Storing User Information

When collecting information from users (registration, deposits, etc.), store it using:

```javascript
// Store profile data
userDataCollector.storeUserInfo(userId, {
    email: 'user@example.com',
    fullName: 'John Doe',
    phone: '+1-555-0123',
    country: 'United States'
});

// Store deposit proof
userDataCollector.storeDepositProof(depositId, base64ImageData, 'Bitcoin');
```

## Analytics & Summary Data

Get quick analytics for a user:

```javascript
userDataCollector.getAnalyticsSummary(userId).then(analytics => {
    console.log('Total Deposits:', analytics.totalDeposits);
    console.log('Total Trades:', analytics.totalTrades);
    console.log('Total Profit:', analytics.totalProfit);
    console.log('Win Rate:', analytics.winRate);
    console.log('Avg Trade Profit:', analytics.avgTradeProfit);
    console.log('Largest Win:', analytics.largestWin);
    console.log('Largest Loss:', analytics.largestLoss);
});
```

## Database Query (Direct API)

### Get all transactions:
```bash
curl http://localhost:3000/admin/transactions
```

### Get user balance:
```bash
curl http://localhost:3000/balance/user_123
```

### Get active trades:
```bash
curl http://localhost:3000/trades/active/user_123
```

### Get trade history:
```bash
curl http://localhost:3000/trades/history/user_123
```

## Data Privacy & Security

- All payment proofs are base64 encoded in localStorage
- Sensitive data should only be accessed by authenticated admin users
- Payment proofs should never be logged to console in production
- Export sensitive data only over secure connections (HTTPS)
- Implement proper access controls on your server

## Compliance

The data collected includes all information needed for:
- KYC (Know Your Customer) compliance
- AML (Anti-Money Laundering) audits
- Trading history reports
- Tax reporting
- Regulatory inquiries
- User support and verification

## Troubleshooting

### Data not showing?
1. Ensure user has made deposits/trades
2. Check browser console for API errors
3. Verify localStorage is enabled
4. Ensure transaction server is running on port 3000

### Export not downloading?
1. Check browser download settings
2. Ensure file isn't blocked by browser
3. Try different browser if issue persists

### Payment proofs missing?
1. Verify proofs were uploaded during deposit
2. Check localStorage for 'paymentProof_' or 'depositProof_' keys
3. Ensure file was successfully stored

## Technical Implementation

Files involved:
- `user-data-collector.js` - Main data collection class
- `transaction-server.js` - Backend API endpoints
- `trades.json` - Trade database
- `transactions.json` - Transaction database
- localStorage - Client-side data storage

## API Integration

To integrate with external systems:

```javascript
// Fetch all user data and send to external system
async function syncDataToExternalSystem(userId, apiEndpoint) {
    const data = await userDataCollector.getAllUserData(userId);
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response.json();
}
```

## Best Practices

1. **Regular Exports**: Export user data regularly for backup
2. **Audit Trail**: Log all data access for compliance
3. **Encryption**: Store sensitive data encrypted
4. **GDPR Compliance**: Implement data deletion requests
5. **Access Control**: Restrict data access to authorized users
6. **Monitoring**: Monitor unusual data access patterns
