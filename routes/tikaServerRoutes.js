const express = require('express');
const router = express.Router();
const tikaController = require('../controllers/tikaServerController');
const upload = require('../utils/multer'); // Your Multer middleware

/**
 * @swagger
 * tags:
 *   - name: Text Extractor (Tika)
 *     description: Text Extractor API using Tika Server
 */

/**
 * @swagger
 * /api/v1/tika/extract-text:
 *   put:
 *     summary: Extract text from a document or image using Tika server
 *     description: Uploads a document (PDF) or image (JPEG/PNG) to the Tika server and returns extracted text. Requires JWT authentication.
 *     tags:
 *       - Text Extractor (Tika)
 *     security:
 *       - BearerAuth: []  # Explicitly require JWT for this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: The document (PDF) or image (JPEG/PNG) file to extract text from
 *             required:
 *               - document
 *     responses:
 *       200:
 *         description: Successfully extracted text
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Extracted text from the document or image
 *       400:
 *         description: Bad request - No file uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No file uploaded or Only JPEG/PNG/PDF files are allowed
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error - Failed to process file with Tika
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to process file with Tika server
 */
router.put(
  '/extract-text',
  upload.single('document'),
  tikaController.extractText
);

module.exports = router;
