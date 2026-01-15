const { User, Transaction, TaskProduct, sequelize } = require('../models');

async function migrateDefaults() {
    try {
        console.log('🛡️ Starting Data Safety Migration (Robust Mode)...');

        // 0. Manual Schema Patches (Skip unreliable sequelize.sync)
        console.log('🔄 Checking Schema...');
        try {
            await sequelize.query("ALTER TABLE Users ADD COLUMN agent_referral_code VARCHAR(255) DEFAULT NULL UNIQUE;");
            console.log('   ✅ Added agent_referral_code');
        } catch (e) { console.log('   ℹ️ agent_referral_code likely exists'); }

        try {
            await sequelize.query("ALTER TABLE TaskProducts ADD COLUMN weekNumber INTEGER DEFAULT 1;");
            console.log('   ✅ Added weekNumber');
        } catch (e) { console.log('   ℹ️ weekNumber likely exists'); }

        try {
            await sequelize.query("ALTER TABLE Transactions ADD COLUMN referenceId VARCHAR(255) DEFAULT NULL UNIQUE;");
            console.log('   ✅ Added referenceId');
        } catch (e) { console.log('   ℹ️ referenceId likely exists'); }


        // 1. Users: agent_referral_code -> Unique 'AGENT_OLD_<ID>'
        console.log('🔹 fixing User.agent_referral_code...');
        const [users] = await sequelize.query("SELECT id FROM Users WHERE agent_referral_code IS NULL");
        if (users.length > 0) {
            for (const user of users) {
                const uniqueCode = `AGENT_OLD_${user.id}_${Math.floor(Math.random() * 1000)}`;
                // Use try-catch for individual updates to ignore 'Duplicate' if re-run
                try {
                    await sequelize.query(`UPDATE Users SET agent_referral_code = '${uniqueCode}' WHERE id = ${user.id}`);
                } catch (e) { }
            }
        }

        // 2. Tasks: weekNumber -> 1
        console.log('🔹 fixing TaskProduct.weekNumber...');
        await sequelize.query("UPDATE TaskProducts SET weekNumber = 1 WHERE weekNumber IS NULL");

        // 3. Transactions: referenceId -> Unique 'OLD_TRX_<ID>'
        console.log('🔹 fixing Transaction.referenceId...');
        const [results] = await sequelize.query("SELECT id FROM Transactions WHERE referenceId IS NULL");
        if (results.length > 0) {
            console.log(`   Found ${results.length} transactions without referenceId.`);
            for (const row of results) {
                const uniqueRef = `OLD_REF_${row.id}_${Date.now()}`;
                try {
                    await sequelize.query(`UPDATE Transactions SET referenceId = '${uniqueRef}' WHERE id = ${row.id}`);
                } catch (e) { }
            }
        }

        console.log('✅ Data Safety Migration Completed Successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration Failed:', err);
        process.exit(1);
    }
}

migrateDefaults();
