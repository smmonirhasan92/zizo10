const { sequelize } = require('../models');

async function inspectTable() {
    try {
        await sequelize.authenticate();
        const [results, metadata] = await sequelize.query("DESCRIBE Notifications");
        console.log("✅ Table 'Notifications' exists. Columns:");
        console.table(results);
    } catch (err) {
        console.error("❌ Error describing table:", err.message);
        try {
            const [results, metadata] = await sequelize.query("SHOW TABLES");
            console.log("Tables in DB:", results);
        } catch (e) {
            console.error(e);
        }
    } finally {
        await sequelize.close();
    }
}

inspectTable();
