const { Transaction, sequelize } = require('./models');
const { Op } = require('sequelize');

async function auditSystemCreated() {
    try {
        console.log("--- AUDITING SYSTEM CREATED MONEY ---");

        const types = ['agent_recharge', 'commission', 'referral_bonus', 'signup_bonus', 'admin_credit', 'task_reward'];

        // 1. Group by Type
        const breakdown = await Transaction.findAll({
            attributes: ['type', [sequelize.fn('sum', sequelize.col('amount')), 'total']],
            where: {
                type: { [Op.or]: types },
                status: 'completed'
            },
            group: ['type']
        });

        console.log("Breakdown by Type:");
        breakdown.forEach(b => console.log(`- ${b.type}: ${b.get('total')}`));

        // 2. Find Large Transactions (> 1000)
        const largeTrx = await Transaction.findAll({
            where: {
                type: { [Op.or]: types },
                status: 'completed',
                amount: { [Op.gt]: 1000 }
            },
            order: [['amount', 'DESC']],
            limit: 10
        });

        console.log("\nTop 10 Large Transactions:");
        largeTrx.forEach(t => console.log(`- ID: ${t.id}, Type: ${t.type}, Amount: ${t.amount}, Created: ${t.createdAt}, Note: ${t.description}`));

    } catch (err) {
        console.error(err);
    }
}

auditSystemCreated();
