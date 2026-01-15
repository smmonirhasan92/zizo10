const { SupportMessage, sequelize } = require('./models');

async function debugSupport() {
    try {
        console.log('Checking SupportMessage table...');

        // Try creating a test message (rollback immediately)
        // We need a valid user ID. I'll use ID 1 or find one.
        const user = await require('./models').User.findOne();
        if (!user) {
            console.log('No users found to test with.');
            return;
        }

        console.log(`Testing with User ID: ${user.id}`);
        const msg = await SupportMessage.create({
            userId: user.id,
            subject: 'Test Debug',
            message: 'Debug Message',
            status: 'pending'
        });

        console.log('Successfully created message:', msg.toJSON());
        await msg.destroy(); // Clean up
        console.log('Test message deleted.');

    } catch (err) {
        console.error('ERROR:', err.original ? err.original.sqlMessage : err);
    } finally {
        await sequelize.close();
    }
}

debugSupport();
