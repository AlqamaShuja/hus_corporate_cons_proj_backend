const { Sequelize } = require('sequelize');
const config = require('../db/config');

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    port: config.development.port,
    dialect: config.development.dialect,
    dialectOptions: config.development.dialectOptions,
    logging: false,
  }
);

// Import Models
const User = require('./User')(sequelize);
const Document = require('./Document')(sequelize);
const Report = require('./Report')(sequelize);
const Payment = require('./Payment')(sequelize);
const Subscription = require('./Subscription')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);
const SupportTicket = require('./SupportTicket')(sequelize);
const Alert = require('./Alert')(sequelize);
const Onboarding = require('./Onboarding')(sequelize);

// User Relation
User.belongsTo(User, { as: 'Creator', foreignKey: 'createdBy' });
User.hasMany(User, { as: 'CreatedUsers', foreignKey: 'createdBy' });
User.hasMany(Document, { foreignKey: 'userId' });
User.hasMany(Report, { foreignKey: 'userId' });
User.hasMany(Payment, { foreignKey: 'userId' });
User.hasMany(Subscription, { foreignKey: 'userId' });
User.hasMany(AuditLog, { foreignKey: 'userId' });
User.hasMany(SupportTicket, { foreignKey: 'userId' });
User.hasMany(Alert, { foreignKey: 'userId' });

// Document
Document.belongsTo(User, { foreignKey: 'userId' });
Document.hasMany(AuditLog, { foreignKey: 'documentId' });
Document.hasMany(Report, { foreignKey: 'documentId' });

// Report
Report.belongsTo(User, { foreignKey: 'userId' });
Report.belongsTo(Document, { foreignKey: 'documentId' });
Report.hasMany(AuditLog, { foreignKey: 'reportId' });

// Payment
Payment.belongsTo(User, { foreignKey: 'userId' });

// Subscription
Subscription.belongsTo(User, { foreignKey: 'userId' });

// AuditLog
AuditLog.belongsTo(User, { foreignKey: 'userId' });
AuditLog.belongsTo(Document, { foreignKey: 'documentId' });
AuditLog.belongsTo(Report, { foreignKey: 'reportId' });

// SupportTicket
SupportTicket.belongsTo(User, { foreignKey: 'userId' });

// Alert
Alert.belongsTo(User, { foreignKey: 'userId' });

// Onboarding
Onboarding.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Onboarding,
  Alert,
  SupportTicket,
  AuditLog,
  Subscription,
  Payment,
  Report,
  Document,
};
