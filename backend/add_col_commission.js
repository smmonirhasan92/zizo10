const { sequelize } = require('./models');

async function addColumn() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB.");

        try {
            await sequelize.query("ALTER TABLE GlobalSettings ADD COLUMN cash_out_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00;");
            console.log("Column 'cash_out_commission_percent' added successfully.");
        } catch (e) {
            if (e.message.includes("Duplicate column name")) {
                console.log("Column already exists.");
            } else {
                console.error("Error adding column:", e.message);
            }
        }

    } catch (err) {
        console.error("DB Connection Error:", err);
    } finally {
        await sequelize.close();
    }
}

addColumn();
