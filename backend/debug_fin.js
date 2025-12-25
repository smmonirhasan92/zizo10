const { Transaction, sequelize } = require('./models');
const { Op } = require('sequelize');

async function debugFinancials() {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        console.log('Current Time (Server):', new Date().toISOString());
        console.log('Start Of Day (Filter):', startOfDay.toISOString());

        const trx = await Transaction.findOne({ order: [['createdAt', 'DESC']] });
        if (trx) {
            console.log('Latest Trx ID:', trx.id);
            console.log('Latest Trx Type:', trx.type);
            console.log('Latest Trx CreatedAt:', trx.createdAt.toISOString());
            console.log('Latest Trx Status:', trx.status);
            console.log('Matches Filter?', trx.createdAt >= startOfDay);
        } else {
            console.log('No Transactions Found.');
        }

        const sum = await Transaction.sum('amount', {
            where: {
                type: { [Op.or]: ['add_money', 'recharge', 'agent_recharge'] },
                status: 'completed',
                createdAt: { [Op.gte]: startOfDay }
            }
        });

        console.log('Sum Result:', sum);

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

debugFinancials();
