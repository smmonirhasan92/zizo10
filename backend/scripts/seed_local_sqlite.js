process.env.USE_LOCAL_DB = 'true'; // Force Models to use Local SQLite
const sequelize = require('../config/database_local');
const { User, Wallet, Transaction, TaskAd } = require('../models');
const bcrypt = require('bcryptjs');

async function seedLocalSQLite() {
    try {
        console.log('🔄 Syncing SQLite Database...');
        await sequelize.sync({ force: true }); // Reset DB

        console.log('🌱 Seeding Dummy Data...');

        // 1. Create Admin
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('123456', salt);

        const admin = await User.create({
            fullName: 'Admin User',
            username: 'admin',
            phone: '01700000000',
            password: hash,
            role: 'admin',
            country: 'Bangladesh',
            kycStatus: 'approved',
            accountStatus: 'active'
        });
        await Wallet.create({ userId: admin.id, balance: 50000.00 });

        // 2. Create Agent
        const agent = await User.create({
            fullName: 'Agent Bond',
            username: 'agent007',
            phone: '01800000000',
            password: hash,
            role: 'agent',
            country: 'Bangladesh',
            kycStatus: 'approved',
            commissionRate: 5.0,
            accountStatus: 'active'
        });
        await Wallet.create({ userId: agent.id, balance: 10000.00 });

        // 3. Create Normal User
        const user = await User.create({
            fullName: 'Test User',
            username: 'testuser',
            phone: '01900000000',
            password: hash,
            role: 'user',
            country: 'Bangladesh',
            accountStatus: 'active'
        });
        await Wallet.create({ userId: user.id, balance: 500.00, income_balance: 50.00 });

        // 4. Create Pending Transactions
        await Transaction.create({
            userId: user.id,
            type: 'add_money',
            amount: 1000.00,
            status: 'pending',
            recipientDetails: 'Bkash TrxID: 8X99S'
        });

        // 5. Create Task Ad
        await TaskAd.create({
            title: 'Test Ad',
            adLink: 'https://google.com',
            imageUrl: 'https://via.placeholder.com/150',
            reviewText: 'Click here',
            priority: 1,
            status: 'active'
        });

        console.log('✅ SQLite Seed Complete! Ready for Testing.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    }
}

seedLocalSQLite();
