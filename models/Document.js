const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
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
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.ENUM('TradeLicense', 'CTCertificate', 'FinancialStatement', 'Other'),
      allowNull: false,
    },
    tag: {
      type: DataTypes.STRING, // For US-D2 (e.g., "Financials Q1")
    },
    version: {
      type: DataTypes.INTEGER, // For US-D1
      defaultValue: 1,
    },
    metadata: {
      type: DataTypes.JSON, // Store AI-extracted data (US-D2, US-AI1)
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return Document;
};