const { User, Wallet, sequelize } = require('../models');

async function revertMigration() {
    const t = await sequelize.transaction();
    try {
        console.log('--- Reverting Migration: User.purchase_balance -> Wallet.balance ---');

        // Find users with Purchase Balance > 0
        const users = await User.findAll({
            where: {
                purchase_balance: { [require('sequelize').Op.gt]: 0 }
            },
            include: [Wallet],
            transaction: t
        });

        console.log(`Found ${users.length} users with Purchase Balance.`);

        for (const user of users) {
            // If user doesn't have a wallet, create one? 
            // Assuming wallet exists since we just migrated checks
            let wallet = user.Wallet;
            if (!wallet) {
                wallet = await Wallet.findOne({ where: { userId: user.id }, transaction: t });
            }

            if (wallet) {
                const amountToMove = parseFloat(user.purchase_balance);
                console.log(`Reverting ${amountToMove} for User: ${user.username} (ID: ${user.id})`);

                // Restore to Main Wallet
                wallet.balance = parseFloat(wallet.balance) + amountToMove;
                await wallet.save({ transaction: t });

                // Zero out Purchase Balance
                user.purchase_balance = 0.00;
                await user.save({ transaction: t });
            }
        }

        await t.commit();
        console.log('Revert Completed Successfully.');

    } catch (error) {
        await t.rollback();
        console.error('Error during revert:', error);
    }
}

revertMigration();
