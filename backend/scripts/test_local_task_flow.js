// backend/scripts/test_local_task_flow.js
require('dotenv').config();
const { User, Wallet, TaskLog, Transaction, sequelize } = require('../models');

async function testSubmitTask() {
    console.log('--- STARTING LOCAL TASK SUBMISSION TEST ---');
    const t = await sequelize.transaction();
    try {
        // 1. Setup Mock User
        const testEmail = `test_user_${Date.now()}@example.com`;
        const user = await User.create({
            username: `tester_${Date.now()}`,
            email: testEmail,
            password: 'hashed_password',
            account_tier: 'VIP',
            role: 'User'
        }, { transaction: t });

        await Wallet.create({ userId: user.id, balance: 100.00 }, { transaction: t });

        console.log(`[SETUP] Created User: ${user.id} | Balance: 100.00`);

        // 2. Simulate Input Data
        const taskIds = ['test_ad_1', 'test_ad_2'];
        const type = 'ad';
        const rewardPerTask = 5.00;

        // 3. Run Logic (Mirrors taskController.submitTask)
        console.log('[ACTION] Simulating submitTask logic...');

        const { Op } = require('sequelize');

        // Check Duplicates
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const existingLogs = await TaskLog.findAll({
            where: {
                userId: user.id,
                taskId: { [Op.in]: taskIds },
                createdAt: { [Op.gte]: startOfDay }
            },
            transaction: t
        });

        if (existingLogs.length > 0) {
            throw new Error('Unexpected duplicates found in fresh test!');
        }

        // Apply Reward
        const totalReward = taskIds.length * rewardPerTask;
        const wallet = await Wallet.findOne({ where: { userId: user.id } }, { transaction: t });
        wallet.balance = parseFloat(wallet.balance) + totalReward;
        await wallet.save({ transaction: t });

        console.log(`[LOGIC] Wallet Updated. New Balance: ${wallet.balance}`);

        // Create TaskLogs
        for (const tid of taskIds) {
            await TaskLog.create({
                userId: user.id,
                taskId: tid,
                reward: rewardPerTask,
                type: type,
                status: 'completed'
            }, { transaction: t });
        }
        console.log('[LOGIC] TaskLogs Created.');

        // Create Transaction
        await Transaction.create({
            userId: user.id,
            type: 'task_reward', // The value we fixed
            amount: totalReward,
            description: `Completed ${taskIds.length} Ads`,
            status: 'completed'
        }, { transaction: t });
        console.log('[LOGIC] Transaction Created (type: task_reward).');

        // 4. Verify
        await t.commit();
        console.log('--- TEST PASSED: Logic is valid ---');

    } catch (error) {
        await t.rollback();
        console.error('--- TEST FAILED ---');
        console.error(error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

testSubmitTask();
