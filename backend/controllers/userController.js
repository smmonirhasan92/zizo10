const { User, AccountTier, Transaction, AuditLog, Wallet, sequelize } = require('../models');

// Upgrade Account Tier
exports.upgradeAccountTier = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.user.id;
        const { planId } = req.body;
        console.log(`[Upgrade] Request for User ${userId}, Plan ${planId}`);

        // Import UserPlan here or at top (assuming it's available in models)
        const { UserPlan } = require('../models');

        const user = await User.findByPk(userId, { transaction: t });
        const plan = await AccountTier.findByPk(planId, { transaction: t });
        const wallet = await Wallet.findOne({ where: { userId } }, { transaction: t });

        if (!user || !plan) {
            console.log('[Upgrade] User or Plan not found');
            await t.rollback();
            return res.status(404).json({ message: 'User or Plan not found' });
        }
        if (!wallet) {
            await t.rollback();
            return res.status(404).json({ message: 'Wallet not found' });
        }

        // Check Balances
        const purchaseBal = parseFloat(user.purchase_balance);
        const mainBal = parseFloat(wallet.balance);
        const planCost = parseFloat(plan.unlock_price);

        if ((purchaseBal + mainBal) < planCost) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient Balance' });
        }

        // Deduct Logic
        let remainingCost = planCost;

        // Stage 1: Deduct from Purchase Wallet
        if (purchaseBal >= remainingCost) {
            user.purchase_balance = purchaseBal - remainingCost;
            remainingCost = 0;
        } else {
            user.purchase_balance = 0.00;
            remainingCost -= purchaseBal;
        }

        // Stage 2: Deduct Remainder from Main Wallet
        if (remainingCost > 0) {
            wallet.balance = mainBal - remainingCost;
            await wallet.save({ transaction: t });
        }

        // Multi-Plan Logic: Create new UserPlan
        await UserPlan.create({
            userId: user.id,
            planName: plan.name,
            status: 'active',
            tasks_completed_today: 0,
            last_task_date: new Date(),
            purchase_date: new Date()
        }, { transaction: t });

        // Update User Tier (For Legacy Display / Badge)
        // We keep this to show the "latest/highest" plan on profile if needed
        user.account_tier = plan.name;

        await user.save({ transaction: t });

        // Log Transaction
        await Transaction.create({
            userId: user.id,
            type: 'purchase',
            amount: -plan.unlock_price,
            description: `Purchased ${plan.name} Plan`,
            status: 'completed'
        }, { transaction: t });

        // --- Premium Referral Bonus Logic (Step 4 & Stress Test 5) ---
        // Only trigger if this is a "Paid" plan (not Free/Trial)
        if (parseFloat(plan.unlock_price) > 0) {
            // Check if user has a referrer
            // We need to fetch 'referrerCode' from user, then find the User. 
            // NOTE: The current User model has 'referral_code' (own) but how do we know WHO referred them?
            // Checking AuthController again... ah, it doesn't seem we stored 'referredBy' in the User model!
            // WAIT. In authController, we just did: `referrer.referral_count += 1`. We didn't save `user.referredBy = referrer.id`.
            // THIS IS A BUG IN THE SCHEMA. We need to store 'referredBy' in the User model to know who to pay later.
            // I will first fix this SCHEMA ISSUE in a migration script.

            // Assuming we fix schema and have `referredBy` (Integer ID) column.
            if (user.referredBy) {
                // Check if this is the FIRST premium plan
                // We count how many 'purchase' transactions this user has made.
                const purchaseCount = await Transaction.count({
                    where: { userId: user.id, type: 'purchase' },
                    transaction: t
                });

                // If count is 1 (this current one), then it's the first time.
                if (purchaseCount === 1) {
                    const referrer = await User.findByPk(user.referredBy, { transaction: t });
                    if (referrer) {
                        const { GlobalSetting } = require('../models');
                        const settings = await GlobalSetting.findOne() || { referral_bonus_amount: 50 };
                        const bonus = parseFloat(settings.referral_bonus_amount);

                        // Credit Referrer
                        if (referrer.Wallet) { // Assuming Wallet relation exists or we fetch it
                            // Actually better to fetch Wallet directly
                            const refWallet = await Wallet.findOne({ where: { userId: referrer.id }, lock: t.LOCK.UPDATE, transaction: t });
                            if (refWallet) {
                                refWallet.balance = parseFloat(refWallet.balance) + bonus;
                                await refWallet.save({ transaction: t });
                            }
                        } else {
                            // Fallback if no wallet found (shouldn't happen)
                            console.error("Referrer Wallet not found!");
                        }

                        // Log Bonus
                        await Transaction.create({
                            userId: referrer.id,
                            type: 'referral_bonus',
                            amount: bonus,
                            status: 'completed',
                            description: 'Bonus for Referral Premium Purchase',
                            recipientDetails: `From: ${user.username}`
                        }, { transaction: t });

                        console.log(`[Referral] Credited ${bonus} to ${referrer.username}`);
                    }
                }
            }
        }
        // ----------------------------------------

        await AuditLog.create({
            adminId: user.id,
            action: 'Plan Purchase',
            details: `User ${user.username} bought ${plan.name} for ${plan.unlock_price}`
        }, { transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: `Successfully activated ${plan.name} plan!`,
            newTier: plan.name,
            newBalance: wallet.balance
        });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ... (Existing Functions) ...

// Get Available Plans
exports.getAccountPlans = async (req, res) => {
    try {
        console.log('Fetching Account Plans for User...');
        const plans = await AccountTier.findAll({
            order: [['unlock_price', 'ASC']]
        });
        console.log(`Found ${plans.length} plans.`);
        res.json(plans);
    } catch (err) {
        console.error('Error fetching plans:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user.user.id;
        const photoUrl = `/uploads/${req.file.filename}`;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.photoUrl = photoUrl;
        await user.save();

        res.json({ message: 'Profile photo uploaded', photoUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Step 8: Promote User (Manual Tier Upgrade)
exports.promoteUser = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { userId, tierId } = req.body;
        const adminId = req.user.user.id;

        const user = await User.findByPk(userId, { transaction: t });
        const tier = await AccountTier.findByPk(tierId, { transaction: t });

        if (!user || !tier) {
            await t.rollback();
            return res.status(404).json({ message: 'User or Tier not found' });
        }

        const oldTier = user.account_tier;
        user.account_tier = tier.name;
        // Optionally update validity or limits if stored on User model (UserPlan usually handles this)
        // For simplicity, we update the display tier and let UserPlan logic handle tasks if needed.
        // Ideally, we should also create a UserPlan here similar to purchase.

        // Create active UserPlan for the promoted tier
        const { UserPlan } = require('../models');
        await UserPlan.create({
            userId: user.id,
            planName: tier.name,
            status: 'active',
            tasks_completed_today: 0,
            last_task_date: new Date(),
            purchase_date: new Date()
        }, { transaction: t });

        await user.save({ transaction: t });

        // Log Action
        await AuditLog.create({
            adminId,
            targetUserId: user.id,
            action: 'Promote User',
            details: `Promoted ${user.username} from ${oldTier} to ${tier.name}`
        }, { transaction: t });

        // Notification (Step 7 Integration)
        const { Notification } = require('../models');
        await Notification.create({
            userId: user.id,
            type: 'system',
            title: '🎉 Congratulations! You have been Promoted!',
            message: `Admin has promoted you to the ${tier.name} tier! Enjoy your new benefits.`,
            isRead: false
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'User promoted successfully', newTier: tier.name });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Step 8: Lock/Unlock Withdraw
exports.lockWithdraw = async (req, res) => {
    try {
        const { userId, isLocked } = req.body; // boolean
        const adminId = req.user.user.id;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isWithdrawLocked = isLocked;
        await user.save();

        await AuditLog.create({
            adminId,
            targetUserId: user.id,
            action: isLocked ? 'Lock Withdraw' : 'Unlock Withdraw',
            details: `Withdraw access has been ${isLocked ? 'LOCKED' : 'UNLOCKED'}`
        });

        res.json({ message: `Withdraw access ${isLocked ? 'locked' : 'unlocked'}`, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Step 8: Impose Penalty
exports.imposePenalty = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { userId, amount, reason } = req.body;
        const adminId = req.user.user.id;

        const user = await User.findByPk(userId, { transaction: t });
        const wallet = await Wallet.findOne({ where: { userId } }, { transaction: t });

        if (!user || !wallet) {
            await t.rollback();
            return res.status(404).json({ message: 'User or Wallet not found' });
        }

        const penaltyAmount = parseFloat(amount);
        if (penaltyAmount <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid penalty amount' });
        }

        // Deduct from Main Balance
        const currentBal = parseFloat(wallet.balance) || 0;
        wallet.balance = (currentBal - penaltyAmount).toFixed(2);
        await wallet.save({ transaction: t });

        // Create 'penalty' Transaction
        await Transaction.create({
            userId: user.id,
            type: 'penalty', // Ensure 'penalty' is handled in Transaction model ENUM or string
            amount: -penaltyAmount, // Negative to show deduction
            description: `Admin Penalty: ${reason}`,
            status: 'completed'
        }, { transaction: t });

        // Audit Log
        await AuditLog.create({
            adminId,
            targetUserId: user.id,
            action: 'Impose Penalty',
            details: `Deducted ${penaltyAmount} from ${user.username}. Reason: ${reason}`
        }, { transaction: t });

        // Notification
        const { Notification } = require('../models');
        await Notification.create({
            userId: user.id,
            type: 'alert',
            title: '⚠️ Penalty Imposed',
            message: `A penalty of ${penaltyAmount} has been deducted from your account. Reason: ${reason}. Please contact admin if you believe this is an error.`,
            isRead: false
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Penalty imposed successfully', newBalance: wallet.balance });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};


// Get All Users (Admin) - Updated with Referral Stats (Step 8)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [
                { model: Wallet },
                // To get total referrals efficiently, we might need a separate count or raw query if performance is key.
                // For now, simpler approach: fetch all and count in JS or use literal.
                // Let's use sequelize.literal for efficiency if possible, but 'referredBy' might check 'referral_code' vs ID.
                // Current Schema: referredBy stores integer ID? Wait, verify schema.
                // User.js says `referredBy: DataTypes.INTEGER` (Wait, I added referredBy column in a migration? Yes step 4).
            ]
        });

        // Step 8: Calculate Referral Stats (Active vs Total)
        // This is heavy for "All Users". Better to do it via a separate stats endpoint or optimized query.
        // Given user request "When admin sees user card", maybe we fetch this detail ON DEMAND or for the list? 
        // User request: "Visual Status: Admin sees ... Active Referrals: X / Total Referrals: Y"
        // Let's attach it to the list response using a subquery promise or map.

        const usersWithStats = await Promise.all(users.map(async (u) => {
            const totalRefs = await User.count({ where: { referredBy: u.id } });
            // Active = User who strictly purchased a plan (unlock_price > 0) OR simply has 'active' status? 
            // User requirement: "X = যারা প্যাকেজ কিনেছে" (Those who bought a package).
            // We can check `purchase_balance` usage or `account_tier` != 'Starter'.
            // Let's count users referred by u.id where account_tier != 'Starter'.
            const { Op } = require('sequelize');
            const activeRefs = await User.count({
                where: {
                    referredBy: u.id,
                    account_tier: { [Op.ne]: 'Starter' }
                }
            });

            return {
                ...u.toJSON(),
                stats: {
                    totalReferrals: totalRefs,
                    activeReferrals: activeRefs
                }
            };
        }));

        res.json(usersWithStats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update User Role (Admin)
exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const validRoles = ['super_admin', 'employee_admin', 'agent', 'user'];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = role;
        await user.save();

        res.json({ message: 'User role updated successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update User Profile (Self)
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const { fullName } = req.body;
        const photoUrl = req.file ? req.file.path : null;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (fullName) user.fullName = fullName;
        if (photoUrl) user.photoUrl = photoUrl;

        await user.save();

        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Change Password (User Self)
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const { oldPassword, newPassword } = req.body;
        const bcrypt = require('bcryptjs');

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Verify Old Password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        // Hash New Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin Reset Password (For User)
exports.adminResetPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        const bcrypt = require('bcryptjs');

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Hash New Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: `Password reset for user ${user.username}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Approve/Suspend User (Blueprint Item 3)
exports.updateAccountStatus = async (req, res) => {
    try {
        const { userId, status } = req.body;
        const validStatuses = ['pending', 'active', 'suspended'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.accountStatus = status;
        await user.save();

        // Log to Audit
        await AuditLog.create({
            adminId: req.user.user.id,
            action: 'Account Status Change',
            details: `Changed status of ${user.username} to ${status}`
        });

        res.json({ message: `User status updated to ${status}`, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
