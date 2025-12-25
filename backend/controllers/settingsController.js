const { GameSetting, GlobalSetting } = require('../models');

// Get Payment Settings
exports.getPaymentSettings = async (req, res) => {
    try {
        const bkashNumber = await GameSetting.findOne({ where: { settingName: 'bkash_number' } });
        const bankDetails = await GameSetting.findOne({ where: { settingName: 'bank_details' } });

        // Fetch Agent Deposit Numbers
        const depositAgentsSetting = await GameSetting.findOne({ where: { settingName: 'deposit_agents' } });
        const depositAgents = depositAgentsSetting && depositAgentsSetting.settingValue ? JSON.parse(depositAgentsSetting.settingValue) : [];

        res.json({
            bkash_number: bkashNumber ? bkashNumber.settingValue : '',
            bank_details: bankDetails ? bankDetails.settingValue : '',
            deposit_agents: depositAgents
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update Payment Settings
exports.updatePaymentSettings = async (req, res) => {
    try {
        const { bkash_number, bank_details } = req.body;

        if (bkash_number) {
            await GameSetting.upsert({ settingName: 'bkash_number', settingValue: bkash_number, description: 'Admin Bkash Number' });
        }
        if (bank_details) {
            await GameSetting.upsert({ settingName: 'bank_details', settingValue: bank_details, description: 'Bank Account Details' });
        }

        // Update Agent/Deposit Numbers List
        if (req.body.deposit_agents) {
            let agentsValue = req.body.deposit_agents;
            // If it's an object/array, stringify it. If string, verify it's valid JSON or store as is.
            if (typeof agentsValue === 'object') {
                agentsValue = JSON.stringify(agentsValue);
            }
            await GameSetting.upsert({
                settingName: 'deposit_agents',
                settingValue: agentsValue,
                description: 'List of Agent Numbers for Deposit'
            });
        }

        res.json({ message: 'Settings updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Global Settings (Referral, Tiers, etc.)
exports.getGlobalSettings = async (req, res) => {
    try {
        const settings = await GlobalSetting.findOne();
        res.json(settings || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateGlobalSettings = async (req, res) => {
    try {
        const { referral_bonus_percent, referral_bonus_amount, silver_requirement, gold_requirement, task_base_reward, daily_task_limit, cash_out_commission_percent } = req.body;

        let settings = await GlobalSetting.findOne();
        if (!settings) {
            settings = await GlobalSetting.create({
                referral_bonus_percent, referral_bonus_amount, silver_requirement, gold_requirement,
                task_base_reward: task_base_reward || 5.00,
                daily_task_limit: daily_task_limit || 10
            });
        } else {
            if (referral_bonus_percent !== undefined) settings.referral_bonus_percent = referral_bonus_percent;
            if (referral_bonus_amount !== undefined) settings.referral_bonus_amount = referral_bonus_amount;
            if (silver_requirement !== undefined) settings.silver_requirement = silver_requirement;
            if (gold_requirement !== undefined) settings.gold_requirement = gold_requirement;
            if (task_base_reward !== undefined) settings.task_base_reward = task_base_reward;
            if (daily_task_limit !== undefined) settings.daily_task_limit = daily_task_limit;
            if (cash_out_commission_percent !== undefined) settings.cash_out_commission_percent = cash_out_commission_percent;
            await settings.save();
        }
        res.json({ message: 'Global Settings Updated', settings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
