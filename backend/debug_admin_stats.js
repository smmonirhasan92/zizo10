const { Transaction, Wallet, User, sequelize } = require('./models');
const { Op } = require('sequelize');

async function debugStats() {
    try {
        console.log("--- DEBUGGING ADMIN STATS ---");

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        console.log("Local StartOfDay:", startOfDay.toString());
        console.log("ISO StartOfDay:", startOfDay.toISOString());

        // 1. Check Trx 119 directly
        const t119 = await Transaction.findByPk(119);
        if (t119) {
            console.log("\n[Trx 119]");
            console.log("  ID:", t119.id);
            console.log("  Type:", t119.type);
            console.log("  Status:", t119.status);
            console.log("  Amount:", t119.amount, "(Type:", typeof t119.amount, ")");
            console.log("  CreatedAt:", t119.createdAt.toISOString());

            const isAfter = t119.createdAt >= startOfDay;
            console.log("  Is CreatedAt >= StartOfDay?", isAfter);
        } else {
            console.log("Trx 119 NOT FOUND");
        }

        // 2. Count Matching Withdrawals
        const count = await Transaction.count({
            where: {
                type: { [Op.or]: ['withdraw', 'send_money', 'cash_out', 'agent_withdraw'] },
                status: 'completed',
                createdAt: { [Op.gte]: startOfDay }
            }
        });
        console.log("\nMatching Rows Count:", count);

        // 3. Sum Matching Withdrawals
        const sum = await Transaction.sum('amount', {
            where: {
                type: { [Op.or]: ['withdraw', 'send_money', 'cash_out', 'agent_withdraw'] },
                status: 'completed',
                createdAt: { [Op.gte]: startOfDay }
            }
        });
        console.log("Sum result:", sum);
        console.log("Abs Sum:", Math.abs(sum || 0));

    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        // process.exit(); 
    }
}

debugStats();
