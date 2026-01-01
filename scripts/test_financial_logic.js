const assert = require('assert');

// Mock Data
const users = [{ id: 1, income_balance: "100.00", tasks_completed_today: 0 }];
const plans = [
    { id: 1, userId: 1, planName: 'Basic', status: 'active', tasks_completed_today: 5, last_task_date: '2026-01-01' },
    { id: 2, userId: 1, planName: 'Pro', status: 'active', tasks_completed_today: 0, last_task_date: '2026-01-01' }
];
const tiers = {
    'Basic': { daily_limit: 5, task_reward: "2.00" },
    'Pro': { daily_limit: 10, task_reward: "5.00" }
};
const MAX_REWARD = 500.00;

// Logic Simulation
async function submitTask(userId) {
    console.log(`[Test] Submitting Task for User ${userId}`);

    // Find User
    const user = users.find(u => u.id === userId);
    if (!user) return { error: 'User not found' };

    // Find Plans
    const activePlans = plans.filter(p => p.userId === userId && p.status === 'active');

    let targetPlan = null;
    let rewardToGive = 0;

    for (const plan of activePlans) {
        const tier = tiers[plan.planName];
        if (!tier) continue;

        if (plan.tasks_completed_today < tier.daily_limit) {
            targetPlan = plan;
            rewardToGive = parseFloat(tier.task_reward);
            break;
        }
    }

    if (!targetPlan) return { error: 'Limit reached' };

    // Safety
    if (rewardToGive > MAX_REWARD) return { error: 'Security Alert' };

    // Update
    targetPlan.tasks_completed_today += 1;

    const currentBal = parseFloat(user.income_balance);
    const newBal = (currentBal + rewardToGive).toFixed(2);

    user.income_balance = newBal;
    user.tasks_completed_today += 1; // Global

    return {
        success: true,
        newBalance: user.income_balance,
        plan: targetPlan.planName,
        reward: rewardToGive
    };
}

// RUN TESTS
async function runTests() {
    console.log('--- Starting Logic Verification ---');

    console.log('Test 1: User has Basic (Full) and Pro (Empty). Should pick Pro.');
    const res1 = await submitTask(1);
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.plan, 'Pro');
    assert.strictEqual(res1.reward, 5.00);
    assert.strictEqual(users[0].income_balance, "105.00"); // 100 + 5
    console.log('PASS: Selected correct plan and updated balance safely.');

    console.log('Test 2: Floating Point Precision Check');
    // Balance is 105.00. Add 5.00.
    const res2 = await submitTask(1);
    assert.strictEqual(res2.newBalance, "110.00");
    console.log('PASS: Precision maintained.');

    console.log('Test 3: Exhaust Plan B');
    // Limit is 10. Completed 2 (res1, res2). Need 8 more.
    for (let i = 0; i < 8; i++) {
        await submitTask(1);
    }
    // Now Pro is full (10/10). Basic is full (5/5).
    const res3 = await submitTask(1);
    assert.strictEqual(res3.error, 'Limit reached');
    console.log('PASS: Correctly blocked when all plans exhausted.');

    console.log('--- All Tests Passed ---');
}

runTests();
