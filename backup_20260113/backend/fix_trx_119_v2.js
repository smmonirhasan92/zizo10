const { Transaction } = require('./models');

async function fixV2() {
    try {
        console.log("Attempting V2 Fix for Trx 119...");

        // Direct Update
        const [updatedRows] = await Transaction.update(
            { type: 'withdraw' },
            { where: { id: 119 } }
        );

        console.log("Rows Updated:", updatedRows);

        // Verify
        const t119 = await Transaction.findByPk(119);
        console.log("New Type:", t119.type);

    } catch (err) {
        console.error("V2 Fix Error:", err);
    }
}
fixV2();
