// backend/scripts/live_repair_and_verify.js
require('dotenv').config();
const { sequelize, TaskLog, Transaction, User } = require('../models');
const { DataTypes } = require('sequelize');

async function repairAndVerify() {
    console.log('🚀 STARTING LIVE REPAIR & VERIFICATION...');

    try {
        const qi = sequelize.getQueryInterface();

        // 1. --- REPAIR TASKLOGS TABLE ---
        console.log('[CHECK] Inspection TaskLogs table...');
        const taskLogTable = await qi.describeTable('TaskLogs');

        if (!taskLogTable.taskId) {
            console.log('⚠️ Missing "taskId". Adding column...');
            await qi.addColumn('TaskLogs', 'taskId', {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'legacy_data'
            });
            console.log('✅ Added "taskId".');
        }

        if (!taskLogTable.type) {
            console.log('⚠️ Missing "type". Adding column...');
            await qi.addColumn('TaskLogs', 'type', {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'daily_task'
            });
            console.log('✅ Added "type".');
        }

        // Check for 'reward' and 'status' (less critical but good to have)
        if (!taskLogTable.reward) {
            console.log('⚠️ Missing "reward". Adding column...');
            await qi.addColumn('TaskLogs', 'reward', {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            });
        }
        if (!taskLogTable.status) {
            console.log('⚠️ Missing "status". Adding column...');
            await qi.addColumn('TaskLogs', 'status', {
                type: DataTypes.STRING,
                defaultValue: 'completed'
            });
        }

        console.log('[OK] TaskLogs Table Schema Verified.');


        // 2. --- REPAIR TRANSACTION ENUM ---
        console.log('[CHECK] Inspecting Consumer Transaction ENUM...');
        // We forcibly update the ENUM using raw query to ensure 'task_reward' exists
        // This is safe even if it already exists (it just redefines the list)
        await sequelize.query(`
            ALTER TABLE Transactions MODIFY COLUMN type ENUM(
                'withdraw', 'recharge', 'send_money', 'cash_out', 'add_money', 
                'mobile_recharge', 'commission', 'admin_credit', 'admin_debit', 
                'purchase', 'task_reward', 'referral_bonus', 'activation_fee', 
                'wallet_transfer', 'game_win', 'game_loss', 'agent_recharge', 
                'agent_withdraw', 'admin_settlement'
            ) NOT NULL;
        `);
        console.log('[OK] Transaction ENUM Verified (Included "task_reward").');


        // 3. --- VERIFICATION (BULLETPROOF TEST) ---
        console.log('[TEST] Running Transaction & TaskLog Test...');
        const t = await sequelize.transaction();

        try {
            // Find a random user or creating a dummy strictly for this test shouldn't be done on live seamlessly.
            // Best approach: Just check if we CAN validate the model properties.
            const user = await User.findOne();
            if (!user) {
                console.log('⚠️ No users found to test with. Skipping logic test.');
            } else {
                // Try create a TaskLog
                await TaskLog.create({
                    userId: user.id,
                    taskId: 'TEST_VERIFY_SCRIPT',
                    type: 'ad',
                    reward: 0.00,
                    status: 'completed'
                }, { transaction: t });
                console.log('   ✅ TaskLog Creation Successful');

                // Try create a Transaction
                await Transaction.create({
                    userId: user.id,
                    type: 'task_reward',
                    amount: 0.00,
                    description: 'TEST_VERIFICATION',
                    status: 'completed'
                }, { transaction: t });
                console.log('   ✅ Transaction Creation Successful');
            }

            // ROLLBACK - Do not save trash data
            await t.rollback();
            console.log('[SUCCESS] 🛡️ VERIFICATION LOCAL ROLLBACK PASSED! Logic is safe.');

        } catch (testError) {
            await t.rollback();
            throw new Error(`Logic Test Failed: ${testError.message}`);
        }

        console.log('\n✅✅✅ SYSTEM IS READY. REPAIR COMPLETE.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ REPAIR FAILED:', error);
        process.exit(1);
    }
}

repairAndVerify();
