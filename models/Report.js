const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Report = sequelize.define('Report', {
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
    documentId: {
      type: DataTypes.UUID,
      references: { model: 'Documents', key: 'id' },
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_payment', 'completed', 'failed'),
      defaultValue: 'draft',
    },
    format: {
      type: DataTypes.ENUM('PDF', 'Word', 'Excel'), // US-C6
      defaultValue: 'PDF',
    },
    data: {
      type: DataTypes.JSON, // Store report data, editable fields (US-C7)
    },
    watermark: {
      type: DataTypes.BOOLEAN, // US-G3
      defaultValue: true,
    },
    generatedAt: {
      type: DataTypes.DATE,
    },
  });

  return Report;
};