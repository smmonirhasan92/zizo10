const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function testLogin() {
    try {
        await sequelize.authenticate();
        const phone = '01711111111';
        const pass = '123456';

        const user = await User.findOne({ where: { phone } });

        if (user) {
            console.log(`User Found: ${user.phone}`);
            console.log(`Stored Hash: ${user.password}`);

            const isMatch = await bcrypt.compare(pass, user.password);
            console.log(`MATCH RESULT: ${isMatch}`); // True/False

            if (isMatch) {
                console.log("✅ Password is CORRECT.");
            } else {
                console.log("❌ Password MISMATCH.");
            }
        } else {
            console.log("❌ User Not Found.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sequelize.close();
    }
}

testLogin();
