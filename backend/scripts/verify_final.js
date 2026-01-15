const { User, Wallet, AuditLog, Transaction, sequelize } = require('../models');
const withdrawalController = require('../controllers/withdrawalController');
const userController = require('../controllers/userController');

async function runVerification() {
    console.log("🚀 Starting Final Verification for Steps 8 & 9...");
    const t = await sequelize.transaction();

    try {
        // 1. Setup Test User
        const timestamp = Date.now();
        const testUser = await User.create({
            username: `verify_${timestamp}`,
            email: `verify_${timestamp}@test.com`,
            password: 'password123',
            phone: `017${timestamp.toString().slice(-8)}`,
            fullName: 'Verification User',
            role: 'user',
            accountStatus: 'active',
            isWithdrawLocked: false // Start unlocked
        }, { transaction: t });

        await Wallet.create({
            userId: testUser.id,
            balance: 1000.00, // Give some balance
            game_balance: 0,
            income_balance: 0,
            deposit_balance: 0 // Added missing field just in case
        }, { transaction: t });

        const adminUser = await User.findOne({ where: { role: 'admin' } }); // Assume an admin exists
        if (!adminUser) throw new Error("No Admin found for testing!");

        console.log(`✅ Test User Created: ${testUser.username} (ID: ${testUser.id})`);

        // 2. Test: Lock Withdraw
        console.log("\n🔒 Testing Withdraw Lock...");
        // Lock the user
        testUser.isWithdrawLocked = true;
        await testUser.save({ transaction: t });

        // Improve consistency: Reload user to ensure lock status is active in memory if controller fetches fresh
        // The controller fetches fresh, so we are good.

        // Mock Request and Response for Withdrawal
        const reqWithdraw = {
            user: { user: { id: testUser.id } },
            body: { amount: 500, method: 'Bkash', walletType: 'main', accountDetails: '01700000000' }
        };
        const resWithdraw = {
            status: (code) => ({
                json: (data) => ({ code, data })
            })
        };

        // Call Controller Logic (We need to mock a real request flow or just check logic manually? 
        // Calling controller directly is better integration test)
        // Note: transaction 't' is local here, but controller creates its own transaction. 
        // We will commit 't' nicely or rely on controller's independent transaction.
        // Actually controller uses its own transaction. To avoid locking, we should commit testUser creation first.
        await t.commit();

        // Re-fetch user to confirm 'isWithdrawLocked' is saved
        const lockedUser = await User.findByPk(testUser.id);
        if (!lockedUser.isWithdrawLocked) throw new Error("User lock failed to save!");

        // Attempt Withdraw
        try {
            // We need to simulate the req/res.
            // Since controller is async and returns res.json, we can capture it.
            let capturedStatus, capturedData;
            const mockRes = {
                status: (code) => { capturedStatus = code; return mockRes; },
                json: (data) => { capturedData = data; return mockRes; }
            };

            await withdrawalController.requestWithdrawal(reqWithdraw, mockRes);

            console.log(`   Withdrawal Response Code: ${capturedStatus}`);
            console.log(`   Withdrawal Message: "${capturedData.message}"`);

            if (capturedStatus === 403 && capturedData.message === "আপনার একাউন্টে কিছু অসঙ্গতি পাওয়া গেছে, দয়া করে অ্যাডমিনের সাথে যোগাযোগ করুন।") {
                console.log("   ✅ PASSED: Blocked with correct Bangla message.");
            } else {
                console.error("   ❌ FAILED: Did not block or wrong message.");
                throw new Error("Withdraw Lock Failed");
            }

        } catch (e) {
            console.error("   ❌ FAILED with Error:", e);
            throw e;
        }

        // 3. Test: Penalty & Audit Log
        console.log("\n⚖️ Testing Penalty & Audit Log...");

        // Impose Penalty API Simulation
        // userController.imposePenalty expects req.params.userId or req.body?
        // Let's check userController signature: exports.imposePenalty = async (req, res) => ... const { userId, amount, reason } = req.body;
        const reqPenalty = {
            user: { user: { id: adminUser.id } }, // Admin performing action
            body: { userId: testUser.id, amount: 200, reason: 'Test Penalty Verification' }
        };

        let penaltyStatus, penaltyData;
        const mockResPenalty = {
            status: (code) => { penaltyStatus = code; return mockResPenalty; },
            json: (data) => { penaltyData = data; return mockResPenalty; }
        };

        await userController.imposePenalty(reqPenalty, mockResPenalty);

        if (penaltyStatus !== 200) {
            console.error("   ❌ Penalty API Failed:", penaltyData);
            throw new Error("Penalty API Failed");
        }

        // Verify Balance Deduction
        const updatedWallet = await Wallet.findOne({ where: { userId: testUser.id } });
        console.log(`   Initial Balance: 1000.00 -> New Balance: ${updatedWallet.balance}`);

        if (parseFloat(updatedWallet.balance) === 800) {
            console.log("   ✅ PASSED: Balance deducted correctly.");
        } else {
            console.error("   ❌ FAILED: Balance incorrect.");
        }

        // Verify Audit Log
        const log = await AuditLog.findOne({
            where: { targetUserId: testUser.id, action: 'Penalty Imposed' },
            order: [['createdAt', 'DESC']]
        });

        if (log) {
            console.log(`   ✅ PASSED: Audit Log found -> [${log.action}] ${log.details}`);
        } else {
            console.error("   ❌ FAILED: Audit Log not found.");
        }

        // Cleanup
        await User.destroy({ where: { id: testUser.id } }); // Cascades usually, but let's be clean
        console.log("\n✅ CLEANUP: Test User deleted.");

    } catch (err) {
        console.error("\n❌ FATAL ERROR During Verification:", err);
        // Try rollback if transaction strictly used, but we committed early for controller test.
    } finally {
        // await sequelize.close(); // Don't close if reusing connection pool
    }
}

runVerification();
