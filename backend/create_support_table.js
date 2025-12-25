const { SupportMessage, sequelize } = require('./models');

async function createTable() {
    try {
        console.log('Creating SupportMessages table...');
        await SupportMessage.sync({ force: true }); // Force create this table
        console.log('Table created successfully!');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await sequelize.close();
    }
}

createTable();
