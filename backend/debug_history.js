
const { User, Transaction } = require('./models');
const sequelize = require('./config/database');

async function checkHistory() {
    try {
        await sequelize.authenticate();

        const phone = '01733333333';
        const user = await User.findOne({
            where: { phone },
            include: [{ model: require('./models').Wallet }]
        });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`User: ${user.username} (${user.phone})`);
        console.log(`Balances -> Main: ${user.Wallet?.balance}, Income: ${user.income_balance}, Purchase: ${user.purchase_balance}`);

        const transactions = await Transaction.findAll({
            where: { userId: user.id },
            order: [['createdAt', 'DESC']]
        });

        console.log('--- Transaction History ---');
        if (transactions.length === 0) {
            console.log('NO TRANSACTIONS FOUND');
        } else {
            console.table(transactions.map(t => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                status: t.status,
                desc: t.description || t.recipientDetails,
                date: t.createdAt
            })));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkHistory();
