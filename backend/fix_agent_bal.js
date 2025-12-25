const { Wallet } = require('./models');

async function fixBalance() {
    try {
        const agentId = 3;
        await Wallet.update({ balance: 50000.00 }, { where: { userId: agentId } });
        console.log('✅ Force updated Agent 3 balance to 50,000');
    } catch (e) {
        console.error(e);
    }
}
fixBalance();
