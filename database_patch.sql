-- Database Patch for Zizo 10 v2.0
-- Syncs database schema with Backend Models

-- Add missing columns to 'users' table
ALTER TABLE `users`
ADD COLUMN `referral_code` varchar(255) DEFAULT NULL AFTER `phone`,
ADD COLUMN `referred_by` varchar(255) DEFAULT NULL AFTER `referral_code`,
ADD COLUMN `referral_count` int(11) DEFAULT 0 AFTER `referred_by`,
ADD COLUMN `income_balance` decimal(10,2) DEFAULT 0.00 AFTER `kycImage`,
ADD COLUMN `purchase_balance` decimal(10,2) DEFAULT 0.00 AFTER `income_balance`,
ADD COLUMN `account_tier` varchar(255) DEFAULT 'Starter' AFTER `purchase_balance`,
ADD COLUMN `last_task_date` date DEFAULT NULL AFTER `account_tier`,
ADD COLUMN `tasks_completed_today` int(11) DEFAULT 0 AFTER `last_task_date`,
ADD COLUMN `agent_due` decimal(10,2) DEFAULT 0.00 AFTER `tasks_completed_today`;

-- Update 'transactions' table ENUM for 'type'
ALTER TABLE `transactions`
MODIFY COLUMN `type` ENUM('withdraw', 'recharge', 'send_money', 'cash_out', 'add_money', 'mobile_recharge', 'commission', 'admin_credit', 'admin_debit', 'purchase', 'task_reward', 'referral_bonus', 'activation_fee', 'wallet_transfer', 'game_win', 'game_loss', 'agent_recharge', 'agent_withdraw', 'admin_settlement') NOT NULL;
