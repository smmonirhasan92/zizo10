const { User, Wallet, Transaction, AuditLog, GlobalSetting } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');

exports.register = async (req, res) => {
    const t = await require('../models').sequelize.transaction();
    try {
        console.log('Register Request Body:', req.body);
        const { fullName, phone, country, password, creatorPhone, referralCode } = req.body;

        // Check if user already exists
        let user = await User.findOne({ where: { phone } });
        if (user) {
            await t.rollback();
            return res.status(400).json({ message: 'User already exists with this phone number.' });
        }

        // Generate Username
        const username = fullName.split(' ')[0].toLowerCase() + Math.floor(1000 + Math.random() * 9000);

        // Generate Unique Random Referral Code (System Generated)
        const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
        const myReferralCode = `REF${randomStr}`;

        // P2P Activation Logic (Legacy/Agent)
        let creatorId = null;
        let kycStatus = 'none';
        const ACTIVATION_FEE = 100.00;

        if (creatorPhone) {
            const creator = await User.findOne({ where: { phone: creatorPhone } }, { transaction: t });
            if (creator && parseFloat(creator.purchase_balance) >= ACTIVATION_FEE) {
                creator.purchase_balance = parseFloat(creator.purchase_balance) - ACTIVATION_FEE;
                await creator.save({ transaction: t });
                creatorId = creator.id;
                kycStatus = 'approved';

                // Log Activation Fee
                await Transaction.create({
                    userId: creatorId,
                    type: 'activation_fee',
                    amount: -ACTIVATION_FEE,
                    status: 'completed',
                    recipientDetails: `Activated User: ${phone}`
                }, { transaction: t });
            }
        }

        // Referral Link Logic
        let referredBy = null;
        if (referralCode) {
            console.log(`[Register] Linking Referral Code: ${referralCode}`);
            const referrer = await User.findOne({ where: { referral_code: referralCode } }, { transaction: t });

            if (referrer) {
                referredBy = referrer.id;
                // Increment referrer count
                referrer.referral_count = (referrer.referral_count || 0) + 1;
                await referrer.save({ transaction: t });
                console.log(`[Register] Linked to Referrer: ${referrer.username}`);
            } else {
                console.log(`[Register] Referrer NOT found for code: ${referralCode}`);
            }
        }

        // Fetch Settings for Signup Bonus (Always runs)
        const globalSettings = await GlobalSetting.findOne();
        const signupBonus = globalSettings ? parseFloat(globalSettings.signup_bonus) : 20.00;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        user = await User.create({
            fullName,
            username,
            phone,
            country,
            password: hashedPassword,
            kycStatus,
            role: 'user',
            income_balance: 0.00,
            purchase_balance: signupBonus,
            account_tier: creatorId ? 'Active' : 'Starter',
            tasks_completed_today: 0,
            referral_code: myReferralCode,
            referredBy: referredBy, // Corrected Field
            accountStatus: 'pending' // Explicitly set to pending per Blueprint
        }, { transaction: t });

        // Log Welcome Bonus Transaction
        if (signupBonus > 0) {
            await Transaction.create({
                userId: user.id,
                type: 'signup_bonus',
                amount: signupBonus,
                status: 'completed',
                description: 'Welcome Signup Bonus',
                recipientDetails: `System Bonus`
            }, { transaction: t });
        }

        // Create Wallet
        await Wallet.create({ userId: user.id }, { transaction: t });

        await t.commit();

        // Generate JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallback_secret_key_12345',
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    message: creatorId ? 'User registered & Activated by Creator!' : 'User registered successfully',
                    token,
                    user: { id: user.id, username, role: user.role, fullName }
                });
            }
        );

    } catch (err) {
        await t.rollback();
        console.error('Registration Error:', err);

        // Write error to debug file
        const logPath = path.join(__dirname, '..', 'debug_error.log');
        const logEntry = `[${new Date().toISOString()}] Registration Error: ${err.message}\nStack: ${err.stack}\n\n`;
        fs.appendFileSync(logPath, logEntry);

        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('Login Request Body:', req.body);
        const { phone, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ where: { phone } });
        if (!user) {
            console.log('User not found for phone:', phone);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        console.log('User found:', user.username);
        console.log('Stored Password Hash:', user.password);

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password Match Result:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check Account Status (Strict Activation Gateway)
        if (user.accountStatus === 'pending') {
            return res.status(403).json({
                message: 'Account not active',
                code: 'ACCOUNT_PENDING',
                user: { id: user.id, username: user.username, phone: user.phone }
            });
        }
        if (user.accountStatus === 'suspended') {
            return res.status(403).json({ message: 'Account has been suspended. Please contact Support.', code: 'ACCOUNT_SUSPENDED' });
        }

        // Generate JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallback_secret_key_12345',
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName } });
            }
        );
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Wallet }] // Include Wallet
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Self-Healing: Generate Referral Code if missing (for legacy users)
        if (!user.referral_code) {
            const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
            user.referral_code = `REF${randomStr}`;
            await user.save();
            console.log(`[Self-Healing] Generated missing referral code for ${user.username}: ${user.referral_code}`);
        }

        // Return user data with explicit wallet_balance from Legacy Wallet
        const userData = user.toJSON();
        userData.wallet_balance = user.Wallet ? user.Wallet.balance : 0.00;

        res.json(userData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
