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

        // Referral Logic (Zizo 10 Logic Flow)
        let referrerCodeStored = null;
        if (referralCode) {
            console.log(`[Register] Processing Referral Code: ${referralCode}`);
            const referrer = await User.findOne({ where: { referral_code: referralCode } }, { transaction: t });

            if (!referrer) {
                console.log(`[Register] Referrer NOT found for code: ${referralCode}`);
            } else {
                console.log(`[Register] Referrer Found: ${referrer.username} (ID: ${referrer.id})`);
                referrerCodeStored = referralCode;

                // Fetch Settings
                const settings = await GlobalSetting.findOne() || { referral_bonus_amount: 50, silver_requirement: 10, gold_requirement: 50 };

                // Credit Bonus (Check Currency Preference)
                const referrerBonus = parseFloat(settings.referral_bonus_amount);

                // Credit Referrer
                if (settings.referral_reward_currency === 'purchase') {
                    referrer.purchase_balance = parseFloat(referrer.purchase_balance) + referrerBonus;
                } else {
                    referrer.income_balance = parseFloat(referrer.income_balance) + referrerBonus;
                }
                referrer.referral_count = (referrer.referral_count || 0) + 1;
                await referrer.save({ transaction: t });

                // Log Referrer Transaction
                await Transaction.create({
                    userId: referrer.id,
                    type: 'referral_bonus',
                    amount: referrerBonus,
                    status: 'completed',
                    description: `Referral Bonus for inviting ${username}`,
                    recipientDetails: `User: ${phone}`
                }, { transaction: t });

                // Auto-Promotion Check (Referrer)
                let promoted = false;
                let newTier = null;
                const refCount = referrer.referral_count;

                // Define Tiers (Higher Priority First)
                if (refCount >= (settings.diamond_requirement || 250) && referrer.account_tier !== 'Diamond' && referrer.account_tier !== 'VIP') {
                    referrer.account_tier = 'Diamond';
                    newTier = 'Diamond';
                    promoted = true;
                } else if (refCount >= (settings.platinum_requirement || 100) && referrer.account_tier !== 'Diamond' && referrer.account_tier !== 'Platinum' && referrer.account_tier !== 'VIP') {
                    referrer.account_tier = 'Platinum';
                    newTier = 'Platinum';
                    promoted = true;
                } else if (refCount >= settings.gold_requirement && !['Diamond', 'Platinum', 'Gold', 'VIP'].includes(referrer.account_tier)) {
                    referrer.account_tier = 'Gold';
                    newTier = 'Gold';
                    promoted = true;
                } else if (refCount >= settings.silver_requirement && !['Diamond', 'Platinum', 'Gold', 'Silver', 'VIP'].includes(referrer.account_tier)) {
                    referrer.account_tier = 'Silver';
                    newTier = 'Silver';
                    promoted = true;
                }

                // Log Promotion (Audit)
                if (promoted) {
                    await AuditLog.create({
                        adminId: referrer.id,
                        action: 'Auto-Promotion',
                        details: `User ${referrer.username} promoted to ${newTier} (Invites: ${referrer.referral_count})`
                    }, { transaction: t });
                }
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
            referred_by: referrerCodeStored
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
