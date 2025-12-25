const { Transaction, Wallet, User, sequelize } = require('./models');

async function fixTransaction119() {
    const t = await sequelize.transaction();
    try {
        console.log("Starting Fix for Trx 119...");

        // 1. Fetch Transaction
        const trx = await Transaction.findByPk(119, { transaction: t });
        if (!trx) throw new Error("Trx 119 not found");

        console.log("Current Trx State:", trx.toJSON());

        // 2. Fix Type if missing
        if (!trx.type || trx.type === '') {
            console.log("Fixing missing type to 'withdraw'...");
            trx.type = 'withdraw';
            await trx.save({ transaction: t });
        }

        // 3. Identify Agent
        const agentId = trx.assignedAgentId || trx.receivedByAgentId;
        if (!agentId) throw new Error("No Agent assigned to Trx 119");

        console.log(`Agent ID found: ${agentId}`);

        // 4. Credit Agent Wallet
        const agentWallet = await Wallet.findOne({ where: { userId: agentId }, transaction: t });
        if (!agentWallet) throw new Error(`Wallet for Agent ${agentId} not found`);

        const amountToCredit = 511.00; // Hardcoded from issue description
        const oldBal = parseFloat(agentWallet.balance);
        const newBal = oldBal + amountToCredit;

        console.log(`Crediting Agent ${agentId}: ${oldBal} + ${amountToCredit} = ${newBal}`);

        agentWallet.balance = newBal.toFixed(2);
        await agentWallet.save({ transaction: t });

        // 5. Log the Credit (Optional but good for audit)
        await Transaction.create({
            userId: agentId,
            type: 'admin_credit',
            amount: amountToCredit,
            status: 'completed',
            description: 'Manual Fix for Trx 119 (Agent Reimbursement)',
            recipientDetails: 'System Fix'
        }, { transaction: t });

        await t.commit();
        console.log("SUCCESS: Transaction 119 fixed and Agent Credited.");

    } catch (err) {
        await t.rollback();
        console.error("FIX FAILED:", err);
    } finally {
        // Close DB connection if script is standalone (but here we just exit)
        process.exit();
    }
}

fixTransaction119();
