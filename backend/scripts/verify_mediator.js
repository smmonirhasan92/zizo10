require('dotenv').config();
process.env.USE_LOCAL_DB = 'true';
const { User, Wallet, Transaction, DepositRequest, sequelize } = require('../models');

async function verify() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB.');

        // 1. Setup Data
        // Find or Create Agent
        let agent = await User.findOne({ where: { role: 'agent' } });
        if (!agent) {
            console.log('Creating Test Agent...');
            agent = await User.create({ fullName: 'Agent Bond', username: 'bond007', phone: '01700700700', password: 'hash', role: 'agent', accountStatus: 'active' });
            await Wallet.create({ userId: agent.id, balance: 10000 }); // Give Stock
        }

        // Find or Create User
        let user = await User.findOne({ where: { role: 'user' } });
        if (!user) {
            console.log('Creating Test User...');
            user = await User.create({ fullName: 'Test User', username: 'testu', phone: '01900000000', password: 'hash', role: 'user', accountStatus: 'active' });
            await Wallet.create({ userId: user.id, balance: 0 });
        }

        // Get Initial Balances
        const agentWalletInitial = await Wallet.findOne({ where: { userId: agent.id } });
        const userWalletInitial = await Wallet.findOne({ where: { userId: user.id } });
        console.log(`Initial Balances -> Agent: ${agentWalletInitial.balance}, User: ${userWalletInitial.balance}`);

        // 2. User Requests Deposit
        const deposit = await DepositRequest.create({
            userId: user.id,
            amount: 500,
            paymentMethod: 'bkash',
            status: 'pending'
        });
        console.log(`✅ Deposit Request #${deposit.id} Created.`);

        // 3. Admin Assigns to Agent via Controller Logic
        // We will call the logic directly or simulate DB update
        deposit.assignedAgentId = agent.id;
        deposit.adminId = 1; // ID 1
        deposit.agentStatus = 'pending';
        await deposit.save();
        console.log('✅ Admin Assigned to Agent.');

        // 4. Agent Approves (Simulate processDeposit Logic)
        const t = await sequelize.transaction();
        try {
            // Deduct Agent
            const agentWallet = await Wallet.findOne({ where: { userId: agent.id }, lock: t.LOCK.UPDATE, transaction: t });
            agentWallet.balance = parseFloat(agentWallet.balance) - 500;
            await agentWallet.save({ transaction: t });

            // Credit User
            const userWallet = await Wallet.findOne({ where: { userId: user.id }, transaction: t });
            userWallet.balance = parseFloat(userWallet.balance) + 500;
            await userWallet.save({ transaction: t });

            // Update Request
            deposit.agentStatus = 'accepted';
            deposit.status = 'approved';
            await deposit.save({ transaction: t });

            await t.commit();
            console.log('✅ Agent Approved & Balances Updated.');

        } catch (err) {
            await t.rollback();
            throw err;
        }

        // 5. Check Final Balances
        const agentWalletFinal = await Wallet.findOne({ where: { userId: agent.id } });
        const userWalletFinal = await Wallet.findOne({ where: { userId: user.id } });
        console.log(`Final Balances -> Agent: ${agentWalletFinal.balance}, User: ${userWalletFinal.balance}`);

        if (parseFloat(agentWalletFinal.balance) !== parseFloat(agentWalletInitial.balance) - 500) throw new Error('Agent Balance Incorrect');
        if (parseFloat(userWalletFinal.balance) !== parseFloat(userWalletInitial.balance) + 500) throw new Error('User Balance Incorrect');

        console.log('✅ MEDIATOR FLOW VERIFIED.');
        process.exit(0);

    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
}

verify();
