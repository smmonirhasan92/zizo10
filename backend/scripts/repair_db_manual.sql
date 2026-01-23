-- RUN THIS IN PHPMYADMIN (SQL TAB)
-- Fixes Missing Columns in TaskLogs causing 500 Error

ALTER TABLE `TaskLogs`
ADD COLUMN `taskId` varchar(255) NOT NULL DEFAULT 'legacy_data',
ADD COLUMN `type` varchar(255) NOT NULL DEFAULT 'daily_task',
ADD COLUMN `status` varchar(255) DEFAULT 'completed',
ADD COLUMN `reward` decimal(10,2) NOT NULL DEFAULT 0.00;

-- Optional: Fix Transactions ENUM if needed (Safe to run)
ALTER TABLE `Transactions` MODIFY COLUMN `type` ENUM(
    'withdraw', 'recharge', 'send_money', 'cash_out', 'add_money', 
    'mobile_recharge', 'commission', 'admin_credit', 'admin_debit', 
    'purchase', 'task_reward', 'referral_bonus', 'activation_fee', 
    'wallet_transfer', 'game_win', 'game_loss', 'agent_recharge', 
    'agent_withdraw', 'admin_settlement'
) NOT NULL;
