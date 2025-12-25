const { User, Wallet, Transaction } = require('./models');

async function checkAgent() {
    try {
        const agentId = 3; // From User Log
        const agent = await User.findByPk(agentId, { include: [Wallet] });
        console.log('--- AGENT 3 STATUS ---');
        console.log('Agent:', agent ? agent.fullName : 'Not Found');
        console.log('Wallet:', agent ? agent.Wallet : 'No Wallet');
        console.log('Balance:', agent?.Wallet?.balance);

        console.log('--- TRANSACTIONS (Type: agent_recharge) ---');
        const trxs = await Transaction.findAll({ where: { userId: agentId, type: 'agent_recharge' } });
        trxs.forEach(t => console.log(`ID: ${t.id}, Amount: ${t.amount}, Status: ${t.status}`));

    } catch (e) {
        console.error(e);
    }
}
checkAgent();
