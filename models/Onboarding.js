const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Onboarding = sequelize.define('Onboarding', {
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
    industry: {
      type: DataTypes.STRING, // US-C3
    },
    revenue: {
      type: DataTypes.DECIMAL(15, 2),
    },
    ftaRegistration: {
      type: DataTypes.STRING, // FTA registration number
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return Onboarding;
};