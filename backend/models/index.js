// Conditional Database Loading for Sandbox/Local Mode
const sequelize = process.env.USE_LOCAL_DB === 'true'
    ? require('../config/database_local')
    : require('../config/database');
const User = require('./User');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const AuditLog = require('./AuditLog');
const DepositRequest = require('./DepositRequest');
const AgentDoc = require('./AgentDoc');
const GlobalSetting = require('./GlobalSetting');
const TaskLog = require('./TaskLog');
const TaskAd = require('./TaskAd'); // NEW Model
const AccountTier = require('./AccountTier'); // NEW Model
const SupportMessage = require('./SupportMessage'); // NEW Model
const UserPlan = require('./UserPlan'); // NEW Model for Multi-Plan
const Notification = require('./Notification'); // Step 7
const TaskProduct = require('./TaskProduct'); // Phase 2: Smart Review
const TaskSchedule = require('./TaskSchedule'); // Phase 3: Dynamic Matrix
const Setting = require('./Setting'); // General Settings


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


User.hasMany(TaskLog, { foreignKey: 'userId' });
TaskLog.belongsTo(User, { foreignKey: 'userId' });

// UserPlan Associations
User.hasMany(UserPlan, { foreignKey: 'userId' });
UserPlan.belongsTo(User, { foreignKey: 'userId' });


// Transaction Agent Association
Transaction.belongsTo(User, { as: 'agent', foreignKey: 'assignedAgentId' });

module.exports = {
    sequelize,
    User,
    Wallet,
    Transaction,
    AuditLog,
    GlobalSetting,
    TaskLog,
    TaskAd,
    AccountTier,
    DepositRequest,
    AgentDoc,
    SupportMessage,
    UserPlan,
    Notification,
    TaskProduct,
    TaskSchedule,
    Setting
};

