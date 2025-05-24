const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadDocument,
  getDocuments,
  generateReport,
  previewReport,
  editReport,
  downloadReport,
  getReportHistory,
  createPayment,
  getPayments,
  topUpCredits,
  getAuditLogs,
  createSupportTicket,
  getSupportTickets,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  SUPER_ADMIN,
  CORPORATE_USER,
  USER,
  CONSULTANCY,
  COMPLIANCE_OFFICER,
} = require('../utils/roles');
const upload = require('../utils/multer');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               role:
 *                 type: string
 *                 enum: [SuperAdmin, CorporateUser, User, Consultancy, ComplianceOfficer]
 *                 example: User
 *               phone:
 *                 type: string
 *                 example: +971123456789
 *               subscription:
 *                 type: string
 *                 enum: [free, standard, premium, enterprise]
 *                 example: free
 *               displayPicture:
 *                 type: string
 *                 format: binary
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *               vatTin:
 *                 type: string
 *                 example: 123456789012345
 *               companyAddress:
 *                 type: string
 *                 example: 123 Business Bay, Dubai, UAE
 *               language:
 *                 type: string
 *                 enum: [English, Arabic, Hindi]
 *                 example: English
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authMiddleware([SUPER_ADMIN, CORPORATE_USER, CONSULTANCY]),
  upload.fields([{ name: 'displayPicture' }, { name: 'companyLogo' }]),
  createUser
);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get(
  '/',
  authMiddleware([SUPER_ADMIN, CORPORATE_USER, CONSULTANCY]),
  getAllUsers
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id',
  authMiddleware([SUPER_ADMIN, CORPORATE_USER, CONSULTANCY]),
  getUserById
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               role:
 *                 type: string
 *                 enum: [SuperAdmin, CorporateUser, User, Consultancy, ComplianceOfficer]
 *                 example: User
 *               phone:
 *                 type: string
 *                 example: +971123456789
 *               subscription:
 *                 type: string
 *                 enum: [free, standard, premium, enterprise]
 *                 example: free
 *               displayPicture:
 *                 type: string
 *                 format: binary
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *               vatTin:
 *                 type: string
 *                 example: 123456789012345
 *               companyAddress:
 *                 type: string
 *                 example: 123 Business Bay, Dubai, UAE
 *               language:
 *                 type: string
 *                 enum: [English, Arabic, Hindi]
 *                 example: English
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  authMiddleware([SUPER_ADMIN, CONSULTANCY]),
  upload.fields([{ name: 'displayPicture' }, { name: 'companyLogo' }]),
  updateUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware([SUPER_ADMIN]), deleteUser);

/**
 * @swagger
 * /api/v1/users/documents:
 *   post:
 *     summary: Upload a document
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - fileType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               fileType:
 *                 type: string
 *                 enum: [TradeLicense, CTCertificate, FinancialStatement, Other]
 *                 example: TradeLicense
 *               tag:
 *                 type: string
 *                 example: Financials Q1
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.post(
  '/documents',
  authMiddleware([CORPORATE_USER, CONSULTANCY, COMPLIANCE_OFFICER]),
  upload.single('file'),
  uploadDocument
);

// /**
//  * @swagger
//  * /api/v1/users/documents:
//  *   get:
//  *     summary: Get all documents for a user
//  *     tags: [Users]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of documents
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/Document'
//  *       403:
//  *         description: Insufficient permissions
//  *       500:
//  *         description: Server error
//  */
// router.get(
//   '/documents',
//   authMiddleware([CORPORATE_USER, CONSULTANCY, COMPLIANCE_OFFICER]),
//   getDocuments
// );

/**
 * @swagger
 * /api/v1/users/reports:
 *   post:
 *     summary: Generate a report
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentId
 *             properties:
 *               documentId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               format:
 *                 type: string
 *                 enum: [PDF, Word, Excel]
 *                 example: PDF
 *     responses:
 *       201:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         description: Bad request
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.post(
  '/reports',
  authMiddleware([CORPORATE_USER, CONSULTANCY, COMPLIANCE_OFFICER]),
  generateReport
);

/**
 * @swagger
 * /api/v1/users/reports/{id}/preview:
 *   get:
 *     summary: Preview a report
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report preview
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.get(
  '/reports/:id/preview',
  authMiddleware([CORPORATE_USER, CONSULTANCY, COMPLIANCE_OFFICER]),
  previewReport
);

/**
 * @swagger
 * /api/v1/users/reports/{id}:
 *   put:
 *     summary: Edit a report
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 example: { vatTin: "123456789012345", exemptions: [] }
 *     responses:
 *       200:
 *         description: Report updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.put(
  '/reports/:id',
  authMiddleware([CORPORATE_USER, CONSULTANCY, COMPLIANCE_OFFICER]),
  editReport
);

/**
 * @swagger
 * /api/v1/users/reports/{id}/download:
 *   get:
 *     summary: Download a report
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Insufficient permissions or payment pending
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.get(
  '/reports/:id/download',
  authMiddleware([CORPORATE_USER, CONSULTANCY, COMPLIANCE_OFFICER]),
  downloadReport
);

/**
 * @swagger
 * /api/v1/users/reports:
 *   get:
 *     summary: Get report history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get(
  '/reports',
  authMiddleware([CORPORATE_USER, CONSULTANCY, COMPLIANCE_OFFICER]),
  getReportHistory
);

/**
 * @swagger
 * /api/v1/users/payments:
 *   post:
 *     summary: Create a payment
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100.00
 *               type:
 *                 type: string
 *                 enum: [report, subscription, credit_topup]
 *                 example: report
 *               stripePaymentId:
 *                 type: string
 *                 example: pi_123456789
 *     responses:
 *       201:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Bad request
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.post(
  '/payments',
  authMiddleware([CORPORATE_USER, CONSULTANCY]),
  createPayment
);

/**
 * @swagger
 * /api/v1/users/payments:
 *   get:
 *     summary: Get payment history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get(
  '/payments',
  authMiddleware([CORPORATE_USER, CONSULTANCY, SUPER_ADMIN]),
  getPayments
);

/**
 * @swagger
 * /api/v1/users/credits/topup:
 *   post:
 *     summary: Top up credits
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50
 *     responses:
 *       200:
 *         description: Credits topped up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 credits:
 *                   type: number
 *       400:
 *         description: Bad request
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.post(
  '/credits/topup',
  authMiddleware([CORPORATE_USER, CONSULTANCY, SUPER_ADMIN]),
  topUpCredits
);

/**
 * @swagger
 * /api/v1/users/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuditLog'
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get(
  '/audit-logs',
  authMiddleware([SUPER_ADMIN, COMPLIANCE_OFFICER]),
  getAuditLogs
);

/**
 * @swagger
 * /api/v1/users/support-tickets:
 *   post:
 *     summary: Create a support ticket
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - description
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Issue with report generation
 *               description:
 *                 type: string
 *                 example: Report failed to generate due to parsing error
 *     responses:
 *       201:
 *         description: Support ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicket'
 *       400:
 *         description: Bad request
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.post(
  '/support-tickets',
  authMiddleware([CORPORATE_USER, CONSULTANCY, COMPLIANCE_OFFICER, USER]),
  createSupportTicket
);

/**
 * @swagger
 * /api/v1/users/support-tickets:
 *   get:
 *     summary: Get support tickets
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of support tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SupportTicket'
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get(
  '/support-tickets',
  authMiddleware([CORPORATE_USER, CONSULTANCY, COMPLIANCE_OFFICER, USER]),
  getSupportTickets
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         filePath:
 *           type: string
 *         fileType:
 *           type: string
 *           enum: [TradeLicense, CTCertificate, FinancialStatement, Other]
 *         tag:
 *           type: string
 *         version:
 *           type: integer
 *         metadata:
 *           type: object
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 123e4567-e89b-12d3-a456-426614174000
 *         userId: 456e7890-e89b-12d3-a456-426614174001
 *         filePath: /uploads/trade_license.pdf
 *         fileType: TradeLicense
 *         tag: Financials Q1
 *         version: 1
 *         metadata: { vatAmount: 5000, confidence: 0.95 }
 *         uploadedAt: 2025-05-25T01:54:00Z
 *     Report:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         documentId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [draft, pending_payment, completed, failed]
 *         format:
 *           type: string
 *           enum: [PDF, Word, Excel]
 *         data:
 *           type: object
 *         watermark:
 *           type: boolean
 *         generatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 123e4567-e89b-12d3-a456-426614174000
 *         userId: 456e7890-e89b-12d3-a456-426614174001
 *         documentId: 789e0123-e89b-12d3-a456-426614174002
 *         status: draft
 *         format: PDF
 *         data: { vatTin: "123456789012345", taxableAmount: 10000 }
 *         watermark: true
 *         generatedAt: 2025-05-25T01:54:00Z
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         amount:
 *           type: number
 *         type:
 *           type: string
 *           enum: [report, subscription, credit_topup]
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *         stripePaymentId:
 *           type: string
 *         credits:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 123e4567-e89b-12d3-a456-426614174000
 *         userId: 456e7890-e89b-12d3-a456-426614174001
 *         amount: 100.00
 *         type: report
 *         status: completed
 *         stripePaymentId: pi_123456789
 *         credits: 5
 *         createdAt: 2025-05-25T01:54:00Z
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         documentId:
 *           type: string
 *         reportId:
 *           type: string
 *         action:
 *           type: string
 *         details:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 123e4567-e89b-12d3-a456-426614174000
 *         userId: 456e7890-e89b-12d3-a456-426614174001
 *         documentId: 789e0123-e89b-12d3-a456-426614174002
 *         reportId: 012e3456-e89b-12d3-a456-426614174003
 *         action: edit_report
 *         details: { field: "vatTin", oldValue: "123", newValue: "456" }
 *         createdAt: 2025-05-25T01:54:00Z
 *     SupportTicket:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         subject:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 123e4567-e89b-12d3-a456-426614174000
 *         userId: 456e7890-e89b-12d3-a456-426614174001
 *         subject: Issue with report generation
 *         description: Report failed to generate due to parsing error
 *         status: open
 *         createdAt: 2025-05-25T01:54:00Z
 */

module.exports = router;
