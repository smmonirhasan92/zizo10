
const { User, Wallet } = require('./models');
const sequelize = require('./config/database');

async function fixUser55Balance() {
    try {
        await sequelize.authenticate();

        const phone = '01755555555';
        const user = await User.findOne({
            where: { phone },
            include: [{ model: Wallet }]
        });

        if (!user || !user.Wallet) {
            console.log('User/Wallet not found');
            return;
        }

        console.log(`Current Balance: ${user.Wallet.balance}`);
        user.Wallet.balance = 1500.00; // 1000 (Seed) + 500 (Completed Transaction)
        await user.Wallet.save();

        console.log(`Updated Balance to: ${user.Wallet.balance}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixUser55Balance();
