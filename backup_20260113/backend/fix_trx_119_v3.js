const { Transaction } = require('./models');

async function fixV3() {
    try {
        console.log("Attempting V3 Fix -> set to 'cash_out'...");

        await Transaction.update(
            { type: 'cash_out' },
            { where: { id: 119 } }
        );

        const t119 = await Transaction.findByPk(119);
        console.log("New Type:", t119.type);

    } catch (err) {
        console.error("V3 Fix Error:", err);
    }
}
fixV3();
