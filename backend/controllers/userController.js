const { User, AccountTier, Transaction, AuditLog, Wallet, sequelize } = require('../models');

// Upgrade Account Tier
exports.upgradeAccountTier = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.user.id;
        const { planId } = req.body;
        console.log(`[Upgrade] Request for User ${userId}, Plan ${planId} `);

        const user = await User.findByPk(userId, { transaction: t });
        const plan = await AccountTier.findByPk(planId, { transaction: t });
        const wallet = await Wallet.findOne({ where: { userId } }, { transaction: t });

        if (!user || !plan) {
            console.log('[Upgrade] User or Plan not found');
            await t.rollback();
            return res.status(404).json({ message: 'User or Plan not found' });
        }
        if (!wallet) {
            console.log('[Upgrade] Wallet not found');
            await t.rollback();
            return res.status(404).json({ message: 'Wallet not found' });
        }

        console.log(`[Upgrade] Balance: ${wallet.balance}, Price: ${plan.unlock_price} `);

        // Check Balances (Mixed Wallet Logic: Purchase First, then Main)
        const purchaseBal = parseFloat(user.purchase_balance);
        const mainBal = parseFloat(wallet.balance);
        const planCost = parseFloat(plan.unlock_price);

        console.log(`[Upgrade] Cost: ${planCost} | Purch: ${purchaseBal} | Main: ${mainBal}`);

        if ((purchaseBal + mainBal) < planCost) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient Balance (Check Purchase & Main Wallets)' });
        }

        let remainingCost = planCost;

        // Stage 1: Deduct from Purchase Wallet
        if (purchaseBal >= remainingCost) {
            user.purchase_balance = purchaseBal - remainingCost;
            remainingCost = 0;
        } else {
            user.purchase_balance = 0.00;
            remainingCost -= purchaseBal;
        }

        // Stage 2: Deduct Remainder from Main Wallet (if needed)
        if (remainingCost > 0) {
            wallet.balance = mainBal - remainingCost;
            await wallet.save({ transaction: t });
        }

        await user.save({ transaction: t });

        /* Legacy Mixed Wallet Logic Removed 
        // Deduct Remainder from Main Wallet
        if (remainingCost > 0) {
            wallet.balance = mainBal - remainingCost;
            await wallet.save({ transaction: t });
        }
        */

        await user.save({ transaction: t });

        // Update User Tier
        user.account_tier = plan.name;

        // Calculate Validity (Optional logic for future)
        // ...

        await user.save({ transaction: t });

        // Log Transaction
        await Transaction.create({
            userId: user.id,
            type: 'purchase', // or 'plan_upgrade'
            amount: -plan.unlock_price, // Negative for debit
            description: `Upgraded to ${plan.name} Plan`,
            status: 'completed'
        }, { transaction: t });

        await AuditLog.create({
            adminId: user.id, // User Action
            action: 'Plan Upgrade',
            details: `User ${user.username} bought ${plan.name} for ${plan.unlock_price}`
        }, { transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: `Successfully upgraded to ${plan.name} `,
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
        const photoUrl = `/ uploads / ${req.file.filename} `;

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

// Get All Users (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
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
