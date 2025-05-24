const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Alert = sequelize.define('Alert', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('payment_issue', 'report_ready', 'low_credit', 'new_device_login', 'subscription_renewal'),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    channel: {
      type: DataTypes.ENUM('email', 'sms', 'both'),
      defaultValue: 'email',
    },
    status: {
      type: DataTypes.ENUM('sent', 'pending', 'failed'),
      defaultValue: 'pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return Alert;
};