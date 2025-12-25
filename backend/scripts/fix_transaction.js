const { Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');

async function fixTransactions() {
    try {
        console.log('--- Fixing Broken Transactions ---');

        // Fix Empty Type 1500 amount
        const trxs = await Transaction.findAll({
            where: {
                amount: 1500.00
            }
        });

        for (const t of trxs) {
            console.log(`Fixing Transaction ID: ${t.id} (Current Type: ${t.type}, Amount: ${t.amount})`);

            t.type = 'purchase';
            t.amount = -1500.00; // Flip to negative
            t.description = 'Plan Purchase (Correction)';
            t.save();
            console.log(`Updated to Type: purchase, Amount: -1500.00`);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

fixTransactions();
