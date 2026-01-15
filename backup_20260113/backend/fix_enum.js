const { sequelize } = require('./models');

async function fixEnum() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Updating Transaction ENUMs...');
        const query = `
            ALTER TABLE Transactions 
            MODIFY COLUMN type 
            ENUM('recharge', 'send_money', 'cash_out', 'add_money', 'mobile_recharge', 'commission', 'admin_credit', 'admin_debit', 'purchase', 'task_reward', 'referral_bonus', 'activation_fee', 'wallet_transfer', 'game_win', 'game_loss', 'agent_recharge', 'agent_withdraw', 'admin_settlement') 
            NOT NULL;
        `;

        await sequelize.query(query);
        console.log('ENUMs updated successfully.');
    } catch (err) {
        console.error('Error updating ENUMs:', err);
    } finally {
        await sequelize.close();
    }
}

fixEnum();
