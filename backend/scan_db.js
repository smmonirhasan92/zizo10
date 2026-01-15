const { Transaction, User, sequelize } = require('./models');

async function scanData() {
    try {
        console.log('Scanning all Users...');
        // Fetch in batches to find the bad one
        const users = await User.findAll({ limit: 1000 });
        console.log(`✅ Loaded ${users.length} Users successfully.`);

        console.log('Scanning all Transactions...');
        const trxs = await Transaction.findAll({ limit: 1000 });
        console.log(`✅ Loaded ${trxs.length} Transactions successfully.`);

        // Check for Wallet Association specifically
        console.log('Testing Wallet Association...');
        const userWithWallet = await User.findOne({
            include: [{ model: require('./models').Wallet }],
            limit: 1
        });
        if (userWithWallet) {
            console.log('✅ Wallet Association OK.');
        } else {
            console.log('⚠️ No users with wallets found (might be empty DB).');
        }

    } catch (err) {
        console.error('❌ DATA SCAN FAILED!');
        console.error('Message:', err.message);
        // If Enum mapping failed:
        if (err.message.includes('enum')) {
            console.error('⚠️ ENUM MISMATCH DETECTED. A value in DB is not in Model definition.');
        }
    } finally {
        await sequelize.close();
    }
}
scanData();
