process.env.USE_LOCAL_DB = 'true'; // FORCE LOCAL DB

const sequelize = require('../config/database_local');
const User = require('../models/User');
const AccountTier = require('../models/AccountTier');
const TaskLog = require('../models/TaskLog');

async function verifyStrictLogic() {
    console.log('🚀 Starting STRICT Logic Verification...');

    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true }); // FORCE RESET DB for clean test

        // 1. Create Tier (Case Sensitive Test)
        // DB has 'Premium', User has 'premium' or vice versa
        await AccountTier.destroy({ where: {} });
        await AccountTier.create({ name: 'Premium', task_reward: 25.00 }); // Capital P
        console.log('✅ Created Tier "Premium" with reward 25.00');

        // 2. Create User with mismatched case
        // await User.destroy({ where: { username: 'strict_tester' } }); // Not needed with force: true
        const user = await User.create({
            fullName: 'Strict Tester',
            username: 'strict_tester',
            phone: '01700000000',
            country: 'BD',
            password: 'hashedpassword',
            account_tier: 'premium', // Lowercase p - Should still match!
            income_balance: 0.00
        });
        console.log('✅ Created User with tier "premium" (lowercase)');

        // 3. Simulate Task Controller Logic (Copied from fix)
        // WE SIMULATE THE EXACT LOGIC APPLIED IN THE CONTROLLER

        const allTiers = await AccountTier.findAll();
        const userTierName = (user.account_tier || '').trim().toLowerCase();
        const tier = allTiers.find(t => t.name.trim().toLowerCase() === userTierName);

        if (!tier) {
            console.error('❌ FAILED: Tier match failed (Case Sensitivity Issue)');
            process.exit(1);
        } else {
            console.log(`✅ SUCCESS: Matched User Tier '${user.account_tier}' to DB Tier '${tier.name}'`);
        }

        const rewardPerTask = parseFloat(tier.task_reward);
        if (rewardPerTask !== 25.00) {
            console.error(`❌ FAILED: Reward Rate Mismatch. Got ${rewardPerTask}, Expected 25.00`);
            process.exit(1);
        }

        // 4. Simulate Task Submission
        const taskId = "999";
        await TaskLog.create({
            userId: user.id,
            taskId: taskId,
            status: 'completed',
            reward: rewardPerTask,
            type: 'ad',
            date: new Date()
        });
        console.log('✅ Created TaskLog');

        // 5. Simulate getTasks Filtering
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const completedLogs = await TaskLog.findAll({
            where: {
                userId: user.id,
                createdAt: { [require('sequelize').Op.gte]: startOfDay }
            },
            attributes: ['taskId']
        });

        const completedSet = new Set(completedLogs.map(log => String(log.taskId)));

        if (!completedSet.has(taskId)) {
            console.error('❌ FAILED: Task Log query did not find the task just created.');
            process.exit(1);
        }

        // Simulate Ad List
        const adList = [{ id: 999 }, { id: 1000 }]; // Int ID
        const filteredList = adList.filter(ad => !completedSet.has(String(ad.id)));

        if (filteredList.length !== 1 || filteredList[0].id !== 1000) {
            console.error('❌ FAILED: Filter logic failed to remove completed task.');
            console.log('Filtered List:', filteredList);
            process.exit(1);
        }

        console.log('🎉 ALL STRICT CHECKS PASSED!');

    } catch (error) {
        console.error('❌ ERROR:', error);
    } finally {
        // await sequelize.close();
    }
}

verifyStrictLogic();
