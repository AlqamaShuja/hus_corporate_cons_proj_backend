const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: { model: 'Users', key: 'id' },
    },
    documentId: {
      type: DataTypes.UUID,
      references: { model: 'Documents', key: 'id' },
    },
    reportId: {
      type: DataTypes.UUID,
      references: { model: 'Reports', key: 'id' },
    },
    action: {
      type: DataTypes.STRING, // e.g., "upload_document", "edit_report", "ai_suggestion"
      allowNull: false,
    },
    details: {
      type: DataTypes.JSON, // Store action details, e.g., changed fields
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return AuditLog;
};
