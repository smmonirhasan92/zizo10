const { Transaction, User, Wallet, DepositRequest, sequelize } = require('../models');

// Get User Balances (Zizo 10 v2.0)
exports.getBalance = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user.id, {
            include: [{ model: Wallet }]
        });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            income_balance: parseFloat(user.income_balance),
            purchase_balance: parseFloat(user.purchase_balance),
            wallet_balance: parseFloat(user.Wallet ? user.Wallet.balance : 0),
            game_balance: parseFloat(user.Wallet ? user.Wallet.game_balance : 0)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// P2P Transfer: Income -> Purchase (User to User)
// Send Money (P2P / Cash Out Request) -> Now PENDING by default
exports.transferMoney = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount, recipientPhone } = req.body;
        const senderId = req.user.user.id;
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // 1. Validate Balance (Mixed Wallet: Income First, then Main)
        const sender = await User.findByPk(senderId, {
            include: [{ model: require('../models').Wallet }],
            transaction: t
        });

        const incomeBal = parseFloat(sender.income_balance);
        const mainBal = parseFloat(sender.Wallet ? sender.Wallet.balance : 0);

        if ((incomeBal + mainBal) < parsedAmount) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient Balance' });
        }

        // 2. Validate Recipient (Optional check if phone exists in DB, but don't credit yet)
        let recipientId = null;
        if (recipientPhone) {
            const recipient = await User.findOne({ where: { phone: recipientPhone } }, { transaction: t });
            if (recipient) recipientId = recipient.id;
            // Note: We don't block if recipient not found? Standard apps might.
            // Let's enforce Recipient Exists for "Send Money"
            if (!recipient) {
                await t.rollback();
                return res.status(404).json({ message: 'Recipient not found' });
            }
            if (recipient.id === sender.id) {
                await t.rollback();
                return res.status(400).json({ message: 'Cannot send to self.' });
            }
        }

        // 3. EXECUTE DEDUCTION (Immediate)
        let remainingAmount = parsedAmount;

        // Stage 1: Deduct from Income
        if (incomeBal >= remainingAmount) {
            sender.income_balance = incomeBal - remainingAmount;
            remainingAmount = 0;
        } else {
            sender.income_balance = 0.00;
            remainingAmount -= incomeBal;
        }

        // Stage 2: Deduct from Main Wallet
        if (remainingAmount > 0) {
            if (sender.Wallet) {
                sender.Wallet.balance = mainBal - remainingAmount;
                await sender.Wallet.save({ transaction: t });
            }
        }
        await sender.save({ transaction: t });

        // 4. Create Transaction (PENDING)
        // This allows Admin/Agent to approve it.
        await Transaction.create({
            userId: sender.id,
            type: 'send_money', // Treated as Withdrawal/CashOut flow
            amount: -parsedAmount, // Negative to show deduction
            status: 'pending', // <--- PENDING STATUS
            recipientDetails: `Sent to: ${recipientPhone}`,
            relatedUserId: recipientId, // The person who is SUPPOSED to get it (or Agent)
            assignedAgentId: null // Admin will assign this
        }, { transaction: t });

        await t.commit();
        res.json({
            message: 'Send Money Request Pending Approval',
            newIncomeBalance: sender.income_balance,
            newMainBalance: sender.Wallet ? sender.Wallet.balance : 0
        });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Alias for Send Money (Frontend uses /send -> sendMoney)
exports.sendMoney = exports.transferMoney;

// Mobile Recharge Request
exports.mobileRecharge = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount, recipientPhone, operator } = req.body;
        const userId = req.user.user.id;
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findByPk(userId, { include: [{ model: Wallet }], transaction: t });

        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        const incomeBal = parseFloat(user.income_balance);
        const mainBal = parseFloat(user.Wallet ? user.Wallet.balance : 0);

        if ((incomeBal + mainBal) < parsedAmount) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient Balance' });
        }

        // Deduct Logic (Income First)
        let remaining = parsedAmount;
        if (incomeBal >= remaining) {
            user.income_balance = incomeBal - remaining;
            remaining = 0;
        } else {
            user.income_balance = 0;
            remaining -= incomeBal;
        }

        if (remaining > 0) {
            if (!user.Wallet) {
                // Should not happen if mainBal check passed, but safety first
                await t.rollback();
                return res.status(400).json({ message: 'Wallet error' });
            }
            user.Wallet.balance = mainBal - remaining;
            await user.Wallet.save({ transaction: t });
        }
        await user.save({ transaction: t });

        // Create Transaction
        await Transaction.create({
            userId,
            type: 'mobile_recharge',
            amount: -parsedAmount,
            status: 'pending',
            recipientDetails: `${operator || 'Mobile'}: ${recipientPhone}`,
            description: 'Mobile Recharge Request'
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Recharge Request Submitted' });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Request Recharge
exports.requestRecharge = async (req, res) => {
    try {
        const { amount, method, transactionId, recipientDetails, receivedByAgentId } = req.body;

        const fs = require('fs');
        try {
            const logMsg = `\n[${new Date().toISOString()}] RECHARGE REQUEST:\n- Body: ${JSON.stringify(req.body)}\n- receivedByAgentId: ${receivedByAgentId} (Type: ${typeof receivedByAgentId})\n`;
            const logPath = require('path').join(__dirname, '../logs', 'debug_recharge.log');
            if (!fs.existsSync(require('path').dirname(logPath))) fs.mkdirSync(require('path').dirname(logPath), { recursive: true });
            fs.appendFileSync(logPath, logMsg);
        } catch (e) {
            console.error("Log failed:", e);
        }

        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return res.status(400).json({ message: 'Invalid Amount' });
        }

        // Handle Multer file
        const proofImage = req.file ? req.file.path : null;

        // Use frontend provided detail or fallback
        const details = recipientDetails || `Method: ${method || 'Bkash'}, TrxID: ${transactionId || 'N/A'}`;

        const transactionData = {
            userId: req.user.user.id,
            type: 'add_money',
            amount: parseFloat(amount),
            status: 'pending',
            recipientDetails: details,
            proofImage
        };

        // If User selected an Agent Number (receivedByAgentId sent from Frontend)
        if (receivedByAgentId) {
            transactionData.receivedByAgentId = receivedByAgentId; // Agent who received the money
            transactionData.assignedAgentId = receivedByAgentId;   // Assign task to them directly
        }

        const transaction = await Transaction.create(transactionData);

        res.status(201).json({ message: 'Recharge request submitted', transaction });
    } catch (err) {
        console.error('Recharge Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Transfer Income Balance to Main Wallet
exports.transferToMain = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.user.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findByPk(userId, { transaction: t });
        const wallet = await Wallet.findOne({ where: { userId } }, { transaction: t });

        if (!user || !wallet) {
            await t.rollback();
            return res.status(404).json({ message: 'User or Wallet not found' });
        }

        if (parseFloat(user.income_balance) < parseFloat(amount)) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient Income Balance' });
        }

        // Execute Transfer to MAIN WALLET (Manual)
        user.income_balance = parseFloat(user.income_balance) - parseFloat(amount);
        wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);

        await user.save({ transaction: t });
        await wallet.save({ transaction: t });

        // Log Transaction
        await Transaction.create({
            userId,
            type: 'add_money',
            amount: amount,
            description: 'Income to Main Wallet',
            status: 'completed'
        }, { transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: 'Transferred to Main Wallet',
            newIncomeBalance: user.income_balance,
            newMainBalance: wallet.balance
        });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Transfer Income Balance to Purchase Wallet
exports.transferToPurchase = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.user.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findByPk(userId, { transaction: t });

        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        if (parseFloat(user.income_balance) < parseFloat(amount)) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient Income Balance' });
        }

        // Execute Transfer to PURCHASE WALLET
        user.income_balance = parseFloat(user.income_balance) - parseFloat(amount);
        user.purchase_balance = parseFloat(user.purchase_balance) + parseFloat(amount);

        await user.save({ transaction: t });

        // Log Transaction
        await Transaction.create({
            userId,
            type: 'wallet_transfer',
            amount: amount,
            description: 'Income to Purchase Wallet',
            status: 'completed',
            recipientDetails: 'Self Transfer'
        }, { transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: 'Transferred to Purchase Wallet',
            newIncomeBalance: user.income_balance,
            newPurchaseBalance: user.purchase_balance
        });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Load Purchase Wallet (Main -> Purchase)
exports.loadPurchaseWallet = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount } = req.body;
        const userId = req.user.user.id;
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findByPk(userId, { include: [{ model: Wallet }], transaction: t });

        if (!user.Wallet || parseFloat(user.Wallet.balance) < parsedAmount) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient Main Wallet Balance' });
        }

        // Deduct from Main
        user.Wallet.balance = parseFloat(user.Wallet.balance) - parsedAmount;
        await user.Wallet.save({ transaction: t });

        // Credit Purchase
        user.purchase_balance = parseFloat(user.purchase_balance) + parsedAmount;
        await user.save({ transaction: t });

        // Log Transaction
        await Transaction.create({
            userId,
            type: 'wallet_transfer',
            amount: -parsedAmount,
            status: 'completed',
            description: 'Main Wallet to Purchase Wallet',
            recipientDetails: 'Self Transfer'
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Transfer Successful' });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Transfer to Game Wallet (Main -> Game)
exports.transferToGame = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount } = req.body;
        const userId = req.user.user.id;

        const wallet = await Wallet.findOne({ where: { userId } }, { transaction: t });
        if (!wallet) {
            await t.rollback();
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const parsedAmount = parseFloat(amount);
        if (parseFloat(wallet.balance) < parsedAmount) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient Main Wallet Balance' });
        }

        // Execute Transfer
        wallet.balance = parseFloat(wallet.balance) - parsedAmount;
        wallet.game_balance = parseFloat(wallet.game_balance || 0) + parsedAmount;

        await wallet.save({ transaction: t });
        await t.commit();

        res.json({
            message: 'Transferred to Game Wallet',
            newBalance: wallet.balance,
            newGameBalance: wallet.game_balance
        });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Withdraw Game Funds (Game -> Main)
exports.withdrawGameFunds = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount } = req.body;
        const userId = req.user.user.id;
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findByPk(userId, { include: [{ model: Wallet }], transaction: t });

        if (!user || !user.Wallet) {
            await t.rollback();
            return res.status(404).json({ message: 'User or Wallet not found' });
        }

        const gameBal = parseFloat(user.Wallet.game_balance || 0);

        if (gameBal < parsedAmount) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient Game Balance' });
        }

        // Deduct from Game Wallet
        user.Wallet.game_balance = gameBal - parsedAmount;

        // Credit Main Wallet
        user.Wallet.balance = parseFloat(user.Wallet.balance) + parsedAmount;

        await user.Wallet.save({ transaction: t });

        // Log Transaction
        await Transaction.create({
            userId,
            type: 'wallet_transfer',
            amount: parsedAmount,
            status: 'completed',
            recipientDetails: 'Game Wallet -> Main Wallet'
        }, { transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: 'Winnings transferred to Main Wallet',
            newMainBalance: user.Wallet.balance,
            newGameBalance: user.Wallet.game_balance
        });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};