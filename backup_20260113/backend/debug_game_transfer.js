const { User, Transaction, Wallet, sequelize } = require('./models');

async function debugGameTransfer() {
    try {
        // Find the user (assuming it's one of the test users, likely the one active)
        // We'll check the last updated user or specific phones
        const users = await User.findAll({
            include: [{ model: Wallet }],
            order: [['updatedAt', 'DESC']],
            limit: 2
        });

        console.log('--- Checking Recent Users ---');
        for (const user of users) {
            console.log(`User: ${user.phone}`);
            console.log(`Main Balance: ${user.Wallet ? user.Wallet.balance : 'N/A'}`);
            console.log(`Game Balance: ${user.game_balance}`);

            const lastTrx = await Transaction.findOne({
                where: { userId: user.id },
                order: [['createdAt', 'DESC']]
            });

            if (lastTrx) {
                console.log(`Last Trx: ID=${lastTrx.id} Type=${lastTrx.type} Amount=${lastTrx.amount} Desc=${lastTrx.description}`);
            }
            console.log('-----------------------------');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugGameTransfer();
