const { GameSetting, Wallet, Transaction, GameLog, sequelize } = require('../models');

// Helper to get setting value
// Helper to get setting value
async function getSetting(key, defaultValue) {
    try {
        const setting = await GameSetting.findOne({ where: { settingName: key } });
        return setting && setting.settingValue !== undefined ? setting.settingValue : defaultValue;
    } catch (err) {
        console.warn(`Failed to fetch setting ${key}, using default.`);
        return defaultValue;
    }
}

// Get Game Info
exports.getGameInfo = async (req, res) => {
    try {
        const rewardAmount = parseFloat(await getSetting('reward_amount', 10)); // Default 10 if not set
        const minBet = parseFloat(await getSetting('min_bet', 10));
        const maxBet = parseFloat(await getSetting('max_bet', 1000));

        res.json({
            rewardAmount,
            minBet,
            maxBet
        });
    } catch (err) {
        console.error("GameInfo Error:", err);
        // Fallback to default if DB fails completely
        res.json({
            rewardAmount: 10,
            minBet: 10,
            maxBet: 1000
        });
    }
};

// Play Game (Head/Tail)
exports.playGame = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { betAmount, choice } = req.body; // Moved to top

        // 1. Check Game Status First
        const gameStatus = await getSetting('game_status', 'active');
        // Ensure string comparison works correctly (trim just in case)
        if (String(gameStatus).trim().toLowerCase() !== 'active') {
            await t.rollback();
            return res.status(503).json({ message: `Game is currently under maintenance (Status: ${gameStatus}). Please try again later.` });
        }

        if (!req.user || !req.user.user || !req.user.user.id) {
            console.error("Game Error: User not found in request", req.user);
            await t.rollback();
            return res.status(401).json({ message: 'Unauthorized: User data missing' });
        }
        const userId = req.user.user.id;
        console.log(`Game Play Request - User: ${userId}, Amount: ${betAmount}, Choice: ${choice}`);

        const amount = parseFloat(betAmount);

        if (isNaN(amount) || amount <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Invalid bet amount' });
        }

        // 2. Check Bet Limits
        const minBet = parseFloat(await getSetting('min_bet', 10));
        const maxBet = parseFloat(await getSetting('max_bet', 1000));

        if (amount < minBet || amount > maxBet) {
            await t.rollback();
            return res.status(400).json({
                message: `Bet amount must be between ৳${minBet} and ৳${maxBet}`
            });
        }

        // Deduct Bet
        const wallet = await Wallet.findOne({ where: { userId } }, { transaction: t });
        if (!wallet) {
            console.error(`Game Error: Wallet not found for user ${userId}`);
            await t.rollback();
            return res.status(404).json({ message: 'Wallet not found' });
        }
        if (wallet.game_balance < amount) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient Game Balance. Please transfer funds to Game Wallet.' });
        }
        await wallet.decrement('game_balance', { by: amount, transaction: t });

        // Logic
        const houseEdge = parseFloat(await getSetting('house_edge', 4)); // 4%
        let winChance = (100 - houseEdge) / 2; // e.g. 48%

        // Check Streak for Logic Adjustment
        const lastGames = await GameLog.findAll({
            where: { userId },
            limit: 5,
            order: [['createdAt', 'DESC']],
            transaction: t
        });

        // "Small Bet Trap" Logic: 4 small bets (<50) then 1 big bet (>200) -> Higher Win Chance
        if (lastGames.length >= 4 && amount > 200) {
            const last4Small = lastGames.slice(0, 4).every(g => parseFloat(g.betAmount) < 50);
            if (last4Small) {
                // Boost by 30%, capped at 85%
                const boostedChance = winChance * 1.3;
                winChance = Math.min(boostedChance, 85);
                console.log(`Logic: Boosted Win Chance to ${winChance}% for User Trap`);
            }
        }

        // "Risk Management": Stop consistent big wins
        if (lastGames.length >= 3 && amount > 200) {
            const last3BigWins = lastGames.slice(0, 3).every(g => parseFloat(g.betAmount) > 200 && g.result === 'win');
            if (last3BigWins) {
                // Reduce by 50% relative to current setting
                winChance = winChance * 0.5;
                console.log(`Logic: Reduced Win Chance to ${winChance}% for Risk Management`);
            }
        }

        // Determine Result
        const random = Math.random() * 100;
        const won = random < winChance;
        const result = won ? 'win' : 'loss';
        let payout = won ? amount * 2 : 0;
        let bonusMsg = '';

        // --- STREAK BONUS LOGIC ---
        if (won) {
            const streakThreshold = parseFloat(await getSetting('streak_threshold', 3));
            const streakMultiplier = parseFloat(await getSetting('streak_multiplier', 1.5));

            // Check if previous (streakThreshold - 1) games were wins
            const recentGames = await GameLog.findAll({
                where: { userId },
                limit: streakThreshold - 1,
                order: [['createdAt', 'DESC']],
                transaction: t
            });

            if (recentGames.length === (streakThreshold - 1)) {
                if (recentGames.every(g => g.result === 'win')) {
                    payout = payout * streakMultiplier;
                    bonusMsg = `(Streak Bonus x${streakMultiplier}! 🔥)`;
                }
            }
        }
        // --- STREAK BONUS LOGIC ---
        if (won) {
            const streakThreshold = parseFloat(await getSetting('streak_threshold', 3));
            const streakMultiplier = parseFloat(await getSetting('streak_multiplier', 1.5)); // e.g., 1.5x payout

            // Check if previous (streakThreshold - 1) games were wins
            const recentGames = await GameLog.findAll({
                where: { userId },
                limit: streakThreshold - 1, // Look back exactly N-1 games
                order: [['createdAt', 'DESC']],
                transaction: t
            });

            // If we have enough history and ALL were wins
            if (recentGames.length === (streakThreshold - 1)) {
                const allWins = recentGames.every(g => g.result === 'win');
                if (allWins) {
                    payout = payout * streakMultiplier;
                    bonusMsg = `(Streak Bonus x${streakMultiplier}! 🔥)`;
                    console.log(`User ${userId} hit streak bonus! Payout: ${payout}`);
                }
            }
        }
        // --------------------------

        // Update Game Wallet on Win
        if (won) {
            await wallet.increment('game_balance', { by: payout, transaction: t });
        }

        // Create Game Log
        await GameLog.create({
            userId,
            gameType: 'head_tail',
            betAmount: amount,
            result,
            payout
        }, { transaction: t });

        // Create Transaction only for "Game Win" (Internal Record)
        if (won) {
            await Transaction.create({
                userId,
                type: 'game_win', // Distinct type for game wins
                amount: payout,
                status: 'completed',
                recipientDetails: `Game Win ${bonusMsg} (Bet: ${amount})`
            }, { transaction: t });
        }

        await t.commit();

        // Return result
        // Simulating the coin flip result consistent with win/loss
        // If won, result matches choice. If loss, result is opposite.
        const coinResult = won ? choice : (choice === 'head' ? 'tail' : 'head');

        res.json({
            won,
            result: coinResult,
            payout,
            newBalance: parseFloat(wallet.game_balance) - amount + payout,
            bonusMsg
        });

    } catch (err) {
        await t.rollback();
        console.error("PLAY GAME ERROR:", err); // Explicit log
        res.status(500).json({ message: err.message || 'Server Error' }); // Return specific error message
    }
};

// Admin: Update Settings
exports.updateSettings = async (req, res) => {
    try {
        const { house_edge, winning_percentage, min_bet, max_bet, game_status } = req.body;

        const updateSetting = async (key, val) => {
            if (val !== undefined && val !== null) {
                await GameSetting.upsert({
                    settingName: key,
                    settingValue: String(val)
                });
            }
        };

        if (winning_percentage !== undefined) {
            const houseEdgeCalc = 100 - (parseFloat(winning_percentage) * 2);
            await updateSetting('house_edge', houseEdgeCalc);
            await updateSetting('winning_percentage', winning_percentage);
        } else if (house_edge !== undefined) {
            await updateSetting('house_edge', house_edge);
            const winChance = (100 - parseFloat(house_edge)) / 2;
            await updateSetting('winning_percentage', winChance);
        }

        await updateSetting('min_bet', min_bet);
        await updateSetting('max_bet', max_bet);
        await updateSetting('game_status', game_status); // Update status

        // Update Streak Settings
        const { streak_threshold, streak_multiplier } = req.body;
        await updateSetting('streak_threshold', streak_threshold);
        await updateSetting('streak_multiplier', streak_multiplier);

        res.json({ message: 'Settings updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
// Admin: Get Settings
exports.getSettings = async (req, res) => {
    try {
        const house_edge = parseFloat(await getSetting('house_edge', 4));
        const winning_percentage = parseFloat(await getSetting('winning_percentage', 48));
        const min_bet = parseFloat(await getSetting('min_bet', 10));
        const max_bet = parseFloat(await getSetting('max_bet', 1000));
        const game_status = await getSetting('game_status', 'active');
        const streak_threshold = parseFloat(await getSetting('streak_threshold', 3));
        const streak_multiplier = parseFloat(await getSetting('streak_multiplier', 1.5));

        res.json({
            house_edge,
            winning_percentage,
            min_bet,
            max_bet,
            game_status,
            streak_threshold,
            streak_multiplier
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
// Admin: Get Deposit Settings (Deposit Numbers -> Agents)
exports.getDepositSettings = async (req, res) => {
    try {
        const deposit_agents = await getSetting('deposit_agents', '[]'); // JSON string default '[]'
        // Parse if string, though getSetting returns float for numbers? 
        // My getSetting helper parses generic? No, it parses parseFloat. 
        // I need to fix getSetting or manually fetch string here.

        // Manual fetch to avoid parseFloat in helper
        const setting = await GameSetting.findOne({ where: { settingName: 'deposit_agents' } });
        let agentsMap = [];
        try {
            if (setting && setting.settingValue) {
                agentsMap = JSON.parse(setting.settingValue);
            }
        } catch (e) {
            console.error("Failed to parse deposit_agents setting, resetting to empty.", e);
            // Optional: Auto-fix? No, just return empty for safety.
            agentsMap = [];
        }

        res.json({ deposit_agents: agentsMap });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Update Deposit Settings
exports.updateDepositSettings = async (req, res) => {
    try {
        const { deposit_agents } = req.body; // Array of { number, agentId, agentName }

        if (deposit_agents) {
            await GameSetting.upsert({
                settingName: 'deposit_agents',
                settingValue: JSON.stringify(deposit_agents),
                description: 'Active Deposit Numbers mapped to Agents'
            });
        }

        res.json({ message: 'Deposit settings updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Get Game Logs
exports.getGameLogs = async (req, res) => {
    try {
        const { User } = require('../models');
        const logs = await GameLog.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: [['fullName', 'name'], 'phone']
            }],
            order: [['createdAt', 'DESC']],
            limit: 100
        });
        res.json(logs);
    } catch (err) {
        console.error("Fetch Game Logs Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Get User Game Stats
exports.getUserGameStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const logs = await GameLog.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        let totalBets = 0;
        let totalPayouts = 0;
        let wins = 0;
        let losses = 0;

        logs.forEach(log => {
            totalBets += parseFloat(log.betAmount);
            totalPayouts += parseFloat(log.payout);
            if (log.result === 'win') wins++;
            else losses++;
        });

        const netProfit = totalPayouts - totalBets;

        res.json({
            totalGames: logs.length,
            totalBets,
            totalPayouts,
            netProfit,
            wins,
            losses,
            recentGames: logs.slice(0, 20)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
