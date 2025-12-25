const { User, Wallet, sequelize } = require('../models');

async function migrateBalances() {
    const t = await sequelize.transaction();
    try {
        console.log('--- Migrating Legacy Wallet Balances to User.purchase_balance ---');

        const wallets = await Wallet.findAll({
            where: {
                balance: { [require('sequelize').Op.gt]: 0 }
            },
            include: [User],
            transaction: t
        });

        console.log(`Found ${wallets.length} wallets with legacy balance.`);

        for (const wallet of wallets) {
            const user = wallet.User;
            if (!user) continue;

            const amountToMove = parseFloat(wallet.balance);

            console.log(`Migrating ${amountToMove} for User: ${user.username} (ID: ${user.id})`);

            // Add to User Purchase Balance
            user.purchase_balance = parseFloat(user.purchase_balance) + amountToMove;
            await user.save({ transaction: t });

            // Zero out Legacy Wallet
            wallet.balance = 0.00;
            await wallet.save({ transaction: t });
        }

        await t.commit();
        console.log('Migration Completed Successfully.');

    } catch (error) {
        await t.rollback();
        console.error('Error during migration:', error);
    }
}

migrateBalances();
