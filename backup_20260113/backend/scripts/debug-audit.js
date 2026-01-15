const { Sequelize, DataTypes, Op } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Load env from one level up (backend root)
dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'walet-game',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
    }
);

// Define models minimally for test to avoid dependency hell
const GameLog = sequelize.define('GameLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER },
    betAmount: { type: DataTypes.DECIMAL(10, 2) },
    payout: { type: DataTypes.DECIMAL(10, 2) }
}, { timestamps: true });

const Transaction = sequelize.define('Transaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.ENUM('deposit', 'send_money') },
    amount: { type: DataTypes.DECIMAL(10, 2) },
    status: { type: DataTypes.STRING }
}, { timestamps: true });

const Wallet = sequelize.define('Wallet', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    balance: { type: DataTypes.DECIMAL(10, 2) },
    game_balance: { type: DataTypes.DECIMAL(10, 2) }
}, { timestamps: true });

async function testAudit() {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Testing Transaction Sum...');
        const totalDeposits = await Transaction.sum('amount', {
            where: { type: 'deposit', status: 'completed' }
        });
        console.log('Total Deposits:', totalDeposits);

        console.log('Testing Wallet Sum...');
        const totalMainWallet = await Wallet.sum('balance');
        console.log('Total Main Wallet:', totalMainWallet);

        console.log('Testing GameLog Sum (Suspected Culprit)...');
        const totalGameBets = await GameLog.sum('betAmount');
        console.log('Total Game Bets:', totalGameBets);

        const totalGamePayouts = await GameLog.sum('payout');
        console.log('Total Game Payouts:', totalGamePayouts);

        console.log('Audit Logic Test Complete. Success.');
    } catch (error) {
        console.error('CRITICAL FAILURE:');
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

testAudit();
