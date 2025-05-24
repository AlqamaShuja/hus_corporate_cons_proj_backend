const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  enable2FA,
  verify2FA,
} = require('../controllers/authController');
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
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *                 example: CorporateUser
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
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.post(
  '/signup',
  // authMiddleware([SUPER_ADMIN, CORPORATE_USER, CONSULTANCY]),
  upload.fields([{ name: 'displayPicture' }, { name: 'companyLogo' }]),
  signup
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', login);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/v1/auth/enable-2fa:
 *   post:
 *     summary: Enable 2FA for a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 qrCode:
 *                   type: string
 *                   description: QR code URL for 2FA setup
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/enable-2fa',
  authMiddleware([CORPORATE_USER, CONSULTANCY, COMPLIANCE_OFFICER]),
  enable2FA
);

/**
 * @swagger
 * /api/v1/auth/verify-2fa:
 *   post:
 *     summary: Verify 2FA code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: 2FA verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid 2FA code
 *       500:
 *         description: Server error
 */
router.post(
  '/verify-2fa',
  authMiddleware([CORPORATE_USER, CONSULTANCY, COMPLIANCE_OFFICER]),
  verify2FA
);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [SuperAdmin, CorporateUser, User, Consultancy, ComplianceOfficer]
 *         phone:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, blocked]
 *         subscription:
 *           type: string
 *           enum: [free, standard, premium, enterprise]
 *         displayPicture:
 *           type: string
 *         companyLogo:
 *           type: string
 *         vatTin:
 *           type: string
 *         companyAddress:
 *           type: string
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: string
 *         language:
 *           type: string
 *           enum: [English, Arabic, Hindi]
 *       example:
 *         id: 123e4567-e89b-12d3-a456-426614174000
 *         name: John Doe
 *         email: john.doe@example.com
 *         role: CorporateUser
 *         phone: +971123456789
 *         status: active
 *         subscription: free
 *         displayPicture: /uploads/displayPicture.jpg
 *         companyLogo: /uploads/companyLogo.jpg
 *         vatTin: 123456789012345
 *         companyAddress: 123 Business Bay, Dubai, UAE
 *         lastLogin: 2025-05-25T01:54:00Z
 *         createdBy: 456e7890-e89b-12d3-a456-426614174001
 *         language: English
 */

module.exports = router;
