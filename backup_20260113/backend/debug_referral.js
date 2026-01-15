const { User, sequelize } = require('./models');

async function debugReferral() {
    try {
        const users = await User.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
        console.log('--- User Referral Codes ---');
        users.forEach(u => {
            console.log(`User: ${u.username} | Phone: ${u.phone} | Code: ${u.referral_code}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        sequelize.close();
    }
}

debugReferral();
