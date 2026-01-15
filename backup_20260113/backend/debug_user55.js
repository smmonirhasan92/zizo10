
const { User, Transaction } = require('./models');
const sequelize = require('./config/database');

async function checkTransactions() {
    try {
        await sequelize.authenticate();

        const phone = '01755555555';
        const user = await User.findOne({
            where: { phone },
            include: [{ model: require('./models').Wallet }]
        });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`User: ${user.username} (${user.phone})`);
        console.log(`Current Main Balance: ${user.Wallet?.balance}`);

        const transactions = await Transaction.findAll({
            where: { userId: user.id },
            order: [['createdAt', 'DESC']]
        });

        console.log('--- Transaction History ---');
        console.table(transactions.map(t => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            status: t.status,
            date: t.createdAt
        })));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkTransactions();
