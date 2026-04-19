/**
 * User Data Collection & Export System
 * Collects all user information including deposits, trades, profile data, etc.
 */

class UserDataCollector {
    constructor() {
        this.dataStore = 'userDataStore_' + new Date().toISOString().split('T')[0];
    }

    /**
     * Get all user data
     */
    async getAllUserData(userId) {
        const data = {
            userId: userId,
            timestamp: new Date().toISOString(),
            profile: this.getProfileData(userId),
            deposits: await this.getDeposits(userId),
            trades: await this.getTrades(userId),
            withdrawals: await this.getWithdrawals(userId),
            payments: this.getPaymentProofs(userId),
            signalsPlan: this.getSignalsPlan(userId),
            sessions: this.getSessions(userId),
        };
        return data;
    }

    /**
     * Get profile data from localStorage
     */
    getProfileData(userId) {
        return {
            userId: userId,
            email: localStorage.getItem('userEmail_' + userId) || 'N/A',
            fullName: localStorage.getItem('userFullName_' + userId) || 'N/A',
            phone: localStorage.getItem('userPhone_' + userId) || 'N/A',
            country: localStorage.getItem('userCountry_' + userId) || 'N/A',
            accountType: localStorage.getItem('userAccountType_' + userId) || 'Basic',
            registeredAt: localStorage.getItem('userRegisteredAt_' + userId) || new Date().toISOString(),
        };
    }

    /**
     * Get deposits from API
     */
    async getDeposits(userId) {
        try {
            const response = await fetch('http://localhost:3000/admin/transactions');
            const transactions = await response.json();
            return transactions.filter(tx => 
                tx.userId === userId && 
                tx.type === 'deposit'
            ).map(tx => ({
                id: tx.id,
                amount: tx.amount,
                status: tx.status,
                createdAt: tx.createdAt,
                method: localStorage.getItem('depositMethod_' + tx.id) || 'Unknown',
                proof: localStorage.getItem('depositProof_' + tx.id) || null,
            }));
        } catch (error) {
            console.error('Error fetching deposits:', error);
            return [];
        }
    }

    /**
     * Get trades from API
     */
    async getTrades(userId) {
        try {
            const response = await fetch(`http://localhost:3000/trades/history/${userId}`);
            const trades = await response.json();
            return trades.map(trade => ({
                id: trade.id,
                amount: trade.amount,
                type: trade.isAI ? 'AI Trading' : 'Manual Trading',
                profit: trade.profit,
                profitPercentage: trade.profitPercentage,
                status: trade.status,
                openedAt: trade.openedAt,
                closedAt: trade.closedAt,
            }));
        } catch (error) {
            console.error('Error fetching trades:', error);
            return [];
        }
    }

    /**
     * Get withdrawals
     */
    async getWithdrawals(userId) {
        try {
            const response = await fetch('http://localhost:3000/admin/transactions');
            const transactions = await response.json();
            return transactions.filter(tx => 
                tx.userId === userId && 
                tx.type === 'withdrawal'
            ).map(tx => ({
                id: tx.id,
                amount: tx.amount,
                status: tx.status,
                createdAt: tx.createdAt,
                address: localStorage.getItem('withdrawalAddress_' + tx.id) || 'N/A',
            }));
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
            return [];
        }
    }

    /**
     * Get payment proofs
     */
    getPaymentProofs(userId) {
        const proofs = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes('paymentProof_' + userId)) {
                proofs.push({
                    key: key,
                    data: localStorage.getItem(key),
                    uploadedAt: localStorage.getItem(key + '_timestamp') || new Date().toISOString(),
                });
            }
        }
        return proofs;
    }

    /**
     * Get signals plan information
     */
    getSignalsPlan(userId) {
        return {
            plan: localStorage.getItem('signalsPlan_' + userId) || 'None',
            activatedAt: localStorage.getItem('signalsPlanDate_' + userId) || null,
            cost: localStorage.getItem('signalsPlanCost_' + userId) || 0,
        };
    }

    /**
     * Get session history
     */
    getSessions(userId) {
        const sessions = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes('session_' + userId)) {
                sessions.push({
                    timestamp: localStorage.getItem(key),
                    duration: localStorage.getItem(key + '_duration') || 'N/A',
                });
            }
        }
        return sessions;
    }

    /**
     * Export user data as JSON
     */
    async exportAsJSON(userId) {
        const data = await this.getAllUserData(userId);
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user_data_${userId}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return json;
    }

    /**
     * Export user data as CSV
     */
    async exportAsCSV(userId) {
        const data = await this.getAllUserData(userId);
        let csv = 'User Data Export\n\n';
        
        // Profile
        csv += 'PROFILE\n';
        Object.entries(data.profile).forEach(([key, value]) => {
            csv += `${key},${value}\n`;
        });
        csv += '\n';

        // Deposits
        csv += 'DEPOSITS\n';
        csv += 'ID,Amount,Status,Date,Method,Proof\n';
        data.deposits.forEach(d => {
            csv += `${d.id},${d.amount},${d.status},${d.createdAt},${d.method},${d.proof ? 'Yes' : 'No'}\n`;
        });
        csv += '\n';

        // Trades
        csv += 'TRADES\n';
        csv += 'ID,Amount,Type,Profit,Profit %,Status,Opened,Closed\n';
        data.trades.forEach(t => {
            csv += `${t.id},${t.amount},${t.type},${t.profit},${t.profitPercentage}%,${t.status},${t.openedAt},${t.closedAt}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user_data_${userId}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Store user data in localStorage for tracking
     */
    storeUserInfo(userId, data) {
        localStorage.setItem('userEmail_' + userId, data.email || '');
        localStorage.setItem('userFullName_' + userId, data.fullName || '');
        localStorage.setItem('userPhone_' + userId, data.phone || '');
        localStorage.setItem('userCountry_' + userId, data.country || '');
        localStorage.setItem('userRegisteredAt_' + userId, new Date().toISOString());
    }

    /**
     * Store deposit proof
     */
    storeDepositProof(depositId, proof, method) {
        localStorage.setItem('depositProof_' + depositId, proof);
        localStorage.setItem('depositMethod_' + depositId, method);
        localStorage.setItem('depositProof_' + depositId + '_timestamp', new Date().toISOString());
    }

    /**
     * Get all users data (admin function)
     */
    async getAllUsersData() {
        try {
            const response = await fetch('http://localhost:3000/admin/transactions');
            const transactions = await response.json();
            
            const userIds = [...new Set(transactions.map(t => t.userId))];
            const allUsersData = {};
            
            for (const userId of userIds) {
                allUsersData[userId] = await this.getAllUserData(userId);
            }
            
            return allUsersData;
        } catch (error) {
            console.error('Error fetching all users data:', error);
            return {};
        }
    }

    /**
     * Export all users data as JSON (admin function)
     */
    async exportAllUsersAsJSON() {
        const data = await this.getAllUsersData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_users_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return json;
    }

    /**
     * Get analytics summary
     */
    async getAnalyticsSummary(userId) {
        const data = await this.getAllUserData(userId);
        
        const totalDeposits = data.deposits.reduce((sum, d) => d.status === 'approved' ? sum + d.amount : sum, 0);
        const totalTrades = data.trades.length;
        const totalProfit = data.trades.reduce((sum, t) => sum + t.profit, 0);
        const winRate = totalTrades > 0 ? (data.trades.filter(t => t.profit > 0).length / totalTrades * 100).toFixed(2) : 0;

        return {
            totalDeposits,
            totalTrades,
            totalProfit,
            winRate: winRate + '%',
            avgTradeProfit: totalTrades > 0 ? (totalProfit / totalTrades).toFixed(2) : 0,
            largestWin: data.trades.length > 0 ? Math.max(...data.trades.map(t => t.profit)).toFixed(2) : 0,
            largestLoss: data.trades.length > 0 ? Math.min(...data.trades.map(t => t.profit)).toFixed(2) : 0,
        };
    }
}

// Create global instance
window.userDataCollector = new UserDataCollector();

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserDataCollector;
}
