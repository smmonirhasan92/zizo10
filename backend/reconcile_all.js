
const { User, Wallet, Transaction } = require('./models');
const sequelize = require('./config/database');

async function reconcileAll() {
    const t = await sequelize.transaction();
    try {
        console.log('Starting System-Wide Reconciliation...');
        const users = await User.findAll({
            include: [{ model: Wallet }],
            transaction: t
        });

        for (const user of users) {
            const walletBal = parseFloat(user.Wallet ? user.Wallet.balance : 0);

            // Get current transaction sum
            const transactions = await Transaction.findAll({
                where: {
                    userId: user.id,
                    status: 'completed'
                },
                transaction: t
            });

            let trxSum = 0;
            for (const trx of transactions) {
                trxSum += parseFloat(trx.amount);
            }

            const diff = walletBal - trxSum;

            if (Math.abs(diff) > 1) {
                console.log(`Fixing User ${user.username} (${user.id}): Bal ${walletBal}, Trx ${trxSum}, Diff ${diff}`);

                // Create Adjustment Transaction
                await Transaction.create({
                    userId: user.id,
                    type: 'add_money', // Using 'add_money' generally, or could use new type 'adjustment'
                    amount: diff, // Can be negative or positive
                    status: 'completed',
                    description: 'System Reconciliation: Unaccounted Balance',
                    recipientDetails: 'System'
                }, { transaction: t });

                console.log(`--> Created Transaction for ${diff}`);
            } else {
                // console.log(`User ${user.username} OK.`);
            }
        }

        await t.commit();
        console.log('Reconciliation Completed Successfully.');

    } catch (error) {
        await t.rollback();
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

reconcileAll();
