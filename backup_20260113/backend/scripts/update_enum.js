const { sequelize } = require('../models');

async function updateEnum() {
    try {
        console.log('Running manual ALTER TABLE...');
        await sequelize.query(`
            ALTER TABLE Transactions 
            MODIFY COLUMN type ENUM(
                'recharge', 
                'send_money', 
                'cash_out', 
                'add_money', 
                'mobile_recharge', 
                'commission', 
                'admin_credit', 
                'admin_debit', 
                'purchase', 
                'task_reward', 
                'referral_bonus', 
                'activation_fee', 
                'wallet_transfer', 
                'game_win', 
                'game_loss'
            ) NOT NULL;
        `);
        console.log('Successfully updated Transaction ENUM!');
    } catch (err) {
        console.error('Error updating ENUM:', err);
    } finally {
        await sequelize.close();
    }
}

updateEnum();
