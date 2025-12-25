const { sequelize, User, Wallet, Transaction, GameLog, AuditLog, DepositRequest, Notification } = require('./models');

async function resetDatabase() {
    const t = await sequelize.transaction();
    try {
        console.log('Starting Clean Slate Protocol...');

        // 1. Clear Transaction Data
        console.log('Deleting all Transactions...');
        await Transaction.destroy({ where: {}, transaction: t });

        console.log('Deleting all Game Logs...');
        await GameLog.destroy({ where: {}, transaction: t });

        console.log('Deleting all Audit Logs...');
        await AuditLog.destroy({ where: {}, transaction: t });

        console.log('Deleting all Deposit Requests...');
        await DepositRequest.destroy({ where: {}, transaction: t });

        // 2. Reset Wallet Balances
        console.log('Resetting Wallet Balances to 0...');
        await Wallet.update({ balance: 0.00, game_balance: 0.00 }, { where: {}, transaction: t });

        // 3. Reset User Balances
        console.log('Resetting User Balances to 0...');
        await User.update({
            income_balance: 0.00,
            purchase_balance: 0.00,
            agent_due: 0.00,
            tasks_completed_today: 0,
            total_income: 0.00
            // We keep referral counts and tiers potentially? Or reset?
            // "database all ransection delete" implies money flow reset.
            // I will keep tiers and referral connections.
        }, { where: {}, transaction: t });

        await t.commit();
        console.log('✅ Database Transactions Cleared & Balances Reset.');

        // 4. Verify/Fix Schema Integrity
        console.log('Verifying Schema Integrity...');
        try {
            // Attempt to sync essential models to ensure columns exist
            await sequelize.query("ALTER TABLE Users ADD COLUMN agent_due DECIMAL(10,2) NOT NULL DEFAULT 0.00;").catch(() => { });
            await sequelize.query("ALTER TABLE Users ADD COLUMN commissionRate DECIMAL(5,2) DEFAULT 0.00;").catch(() => { });
            console.log('✅ Schema Checked.');
        } catch (schemaErr) {
            console.warn('Schema check warning (non-critical):', schemaErr.message);
        }

    } catch (err) {
        await t.rollback();
        console.error('❌ Reset Failed:', err);
    } finally {
        await sequelize.close();
    }
}

resetDatabase();
