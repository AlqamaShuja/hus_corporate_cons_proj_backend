const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('SuperAdmin', 'CorporateUser', 'User', 'Consultancy', 'ComplianceOfficer'),
      allowNull: false,
      defaultValue: 'User',
    },
    phone: {
      type: DataTypes.STRING,
      validate: { is: /^\+?[1-9]\d{1,14}$/ }, // E.164 phone number format
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'blocked'),
      defaultValue: 'active',
    },
    subscription: {
      type: DataTypes.ENUM('free', 'standard', 'premium', 'enterprise'),
      defaultValue: 'free',
    },
    displayPicture: {
      type: DataTypes.STRING,
    },
    companyLogo: {
      type: DataTypes.STRING, // For US-P1, US-G7
    },
    vatTin: {
      type: DataTypes.STRING, // For US-C6, US-C7
      validate: { len: [15, 15] }, // UAE TIN is 15 digits
    },
    companyAddress: {
      type: DataTypes.TEXT, // For US-C6, US-C7
    },
    twoFactorSecret: {
      type: DataTypes.STRING, // For US-C1 (2FA)
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
    resetPasswordOtp: {
      type: DataTypes.STRING,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
    },
    language: {
      type: DataTypes.ENUM('English', 'Arabic', 'Hindi'), // For US-A13
      defaultValue: 'English',
    },
  });

  return User;
};