const sequelize = require('../config/database');
const User = require('./User');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const AuditLog = require('./AuditLog');
const GameSetting = require('./GameSetting');
const DepositRequest = require('./DepositRequest');
const AgentDoc = require('./AgentDoc');
const GameLog = require('./GameLog');
const GlobalSetting = require('./GlobalSetting');
const TaskLog = require('./TaskLog');
const TaskAd = require('./TaskAd'); // NEW Model
const AccountTier = require('./AccountTier'); // NEW Model
const SupportMessage = require('./SupportMessage'); // NEW Model

// Associations
User.hasOne(Wallet, { foreignKey: 'userId', onDelete: 'CASCADE' });
Wallet.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(SupportMessage, { foreignKey: 'userId' });
SupportMessage.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(AuditLog, { foreignKey: 'adminId' });
AuditLog.belongsTo(User, { foreignKey: 'adminId' });

User.hasMany(DepositRequest, { foreignKey: 'userId' });
DepositRequest.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(AgentDoc, { foreignKey: 'userId' });
AgentDoc.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(GameLog, { foreignKey: 'userId', as: 'gameLogs' });
GameLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(TaskLog, { foreignKey: 'userId' }); // Added Association
TaskLog.belongsTo(User, { foreignKey: 'userId' });

// Transaction Agent Association
Transaction.belongsTo(User, { as: 'agent', foreignKey: 'assignedAgentId' });

module.exports = {
    sequelize,
    User,
    Wallet,
    Transaction,
    AuditLog,
    GameSetting,
    GlobalSetting,
    TaskLog,
    TaskAd, // Added Export
    AccountTier, // NEW
    DepositRequest,
    AgentDoc,
    GameLog,
    SupportMessage
};
