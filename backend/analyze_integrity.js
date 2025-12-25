
const { User, Wallet, Transaction } = require('./models');
const sequelize = require('./config/database');

async function analyzeIntegrity() {
    try {
        await sequelize.authenticate();
        console.log('Analyzing System Integrity...');

        const users = await User.findAll({
            include: [{ model: Wallet }]
        });

        console.log('userId | Username | Phone | WalletBalance | TrxSum | Status | Diff');
        console.log('-------|----------|-------|---------------|--------|--------|-----');

        for (const user of users) {
            const walletBal = parseFloat(user.Wallet ? user.Wallet.balance : 0);

            const transactions = await Transaction.findAll({
                where: {
                    userId: user.id,
                    status: 'completed'
                }
            });

            let trxSum = 0;
            for (const t of transactions) {
                // Adjust logic: If type is 'activation_fee' or similar that might not be in wallet balance?
                // Assuming all completed transactions affect Main Wallet unless specified otherwise.
                // We might need to filter only Main Wallet relevant types. 
                // For now, simple sum check.
                trxSum += parseFloat(t.amount);
            }

            const diff = walletBal - trxSum;
            const status = Math.abs(diff) < 1 ? 'OK' : 'MISMATCH';

            console.log(`${user.id} | ${user.username} | ${user.phone} | ${walletBal.toFixed(2)} | ${trxSum.toFixed(2)} | ${status} | ${diff.toFixed(2)}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

analyzeIntegrity();
