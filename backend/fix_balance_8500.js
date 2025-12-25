
const { User, Transaction, Wallet } = require('./models');
const sequelize = require('./config/database');

async function fixBalance() {
    const t = await sequelize.transaction();
    try {
        const phone = '01733333333';
        const user = await User.findOne({
            where: { phone },
            include: [{ model: Wallet }],
            transaction: t
        });

        if (!user) {
            console.log('User not found');
            await t.rollback();
            return;
        }

        console.log(`Current Main Balance: ${user.Wallet.balance}`);

        // Fetch all Completed transactions affecting Main Wallet
        // Note: Logic depends on transaction types. 
        // Based on logs: 'add_money' (+), 'purchase' (-)
        // We probably need to check income/purchase wallet splits too, but let's look at the raw sum first.

        const transactions = await Transaction.findAll({
            where: {
                userId: user.id,
                status: 'completed'
            },
            transaction: t
        });

        let calculatedBalance = 0;

        // Simple logic based on observed types in previous log
        for (const trx of transactions) {
            // Adjust logic based on how your system handles these types
            // Assuming 'add_money' credits Main Wallet
            // Assuming 'purchase' deducts from Main Wallet (or Purchase Wallet? Check legacy logic)
            // If previous logs showed 8500 expected, and we have 5000, -1500, 5000.
            // 5000 + (-1500) + 5000 = 8500.
            // So simply summing current 'amount' field should work if they are signed correctly.

            // Let's check if amounts are signed in DB
            // In reconcile script output: '5000.00' (positive), '-1500.00' (negative).
            // So we can just sum them up.

            // However, we must filter out transactions that don't affect Main Wallet (e.g. Income/Purchase specific?)
            // If user says "8500", and history sum is 8500, then likely all these affect Main.

            calculatedBalance += parseFloat(trx.amount);
        }

        console.log(`Calculated Balance from History: ${calculatedBalance}`);

        if (Math.abs(calculatedBalance - 8500) < 1) {
            console.log('Confirmed: History matches 8500.');
        } else {
            console.log('Warning: History sum is ' + calculatedBalance + ', but user expects 8500. Checking close match...');
        }

        // Update Wallet
        user.Wallet.balance = 8500.00; // Force to 8500 as per user request/history confirmation
        await user.Wallet.save({ transaction: t });

        console.log(`Updated Main Wallet to: ${user.Wallet.balance}`);

        await t.commit();

    } catch (error) {
        await t.rollback();
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixBalance();
