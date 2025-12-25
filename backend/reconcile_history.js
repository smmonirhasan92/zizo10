
const { User, Transaction, Wallet } = require('./models');
const sequelize = require('./config/database');

async function reconcileHistory() {
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

        const mainBal = parseFloat(user.Wallet ? user.Wallet.balance : 0);
        const incomeBal = parseFloat(user.income_balance);
        const purchaseBal = parseFloat(user.purchase_balance);

        console.log(`Balances -> Main: ${mainBal}, Income: ${incomeBal}, Purchase: ${purchaseBal}`);

        // Fetch existing sum
        const transactions = await Transaction.findAll({ where: { userId: user.id }, transaction: t });
        let trxSumMain = 0; // Rough approximation, real logic is complex but assumes empty history

        if (transactions.length === 0) {
            console.log('History empty. Backfilling...');

            // Backfill Main Wallet
            if (mainBal > 0) {
                await Transaction.create({
                    userId: user.id,
                    type: 'add_money',
                    amount: mainBal,
                    status: 'completed',
                    description: 'Opening Balance Adjustment'
                }, { transaction: t });
                console.log(`Added Main Wallet Adjustment: ${mainBal}`);
            }

            // Backfill Income Wallet
            if (incomeBal > 0) {
                await Transaction.create({
                    userId: user.id,
                    type: 'bonus', // or 'referral_bonus' approximation
                    amount: incomeBal,
                    status: 'completed',
                    description: 'Income Adjustment'
                }, { transaction: t });
                console.log(`Added Income Wallet Adjustment: ${incomeBal}`);
            }

            // Backfill Purchase Wallet
            if (purchaseBal > 0) {
                await Transaction.create({
                    userId: user.id,
                    type: 'add_money',
                    amount: purchaseBal,
                    status: 'completed',
                    description: 'Purchase Balance Adjustment'
                }, { transaction: t });
                console.log(`Added Purchase Wallet Adjustment: ${purchaseBal}`);
            }

            await t.commit();
            console.log('Reconciliation Complete.');
        } else {
            console.log('History NOT empty. Skipping specific empty-history reconciliation.');
            await t.rollback();
        }

    } catch (error) {
        await t.rollback();
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

reconcileHistory();
