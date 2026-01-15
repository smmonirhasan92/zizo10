const { Sequelize } = require('sequelize');
const sequelize = require('./config/database_local'); // Using local DB config directly
const DepositRequest = require('./models/DepositRequest');

async function checkImages() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const reqs = await DepositRequest.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
        console.log('--- Recent Deposit Requests ---');
        reqs.forEach(r => {
            console.log(`ID: ${r.id}, Amount: ${r.amount}, Proof: '${r.proofImage}'`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}
checkImages();
