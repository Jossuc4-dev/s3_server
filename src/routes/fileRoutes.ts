import { Router } from 'express';
import { fileController } from '../controller/fileController.ts';
import { uploadSingle, uploadMultiple } from '../middlewares/upload.ts';

const router = Router();

/**
 * @swagger
 * /files/upload:
 *   post:
 *     summary: Upload a single file
 *     description: Upload an image, PDF, or video file
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (image, PDF, or video)
 *               category:
 *                 type: string
 *                 description: Optional category for the file
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional tags for the file
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: No file uploaded or invalid file type
 *       500:
 *         description: Server error
 */
router.post('/upload', uploadSingle, fileController.uploadSingleFile.bind(fileController));

/**
 * @swagger
 * /files/upload-multiple:
 *   post:
 *     summary: Upload multiple files
 *     description: Upload multiple images, PDFs, or videos
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload
 *               category:
 *                 type: string
 *                 description: Optional category for all files
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional tags for all files
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: No files uploaded or invalid file types
 *       500:
 *         description: Server error
 */
router.post('/upload-multiple', uploadMultiple, fileController.uploadMultipleFiles.bind(fileController));

/**
 * @swagger
 * /files/{fileId}:
 *   get:
 *     summary: Download a file
 *     description: Get the file content by ID
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File content
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 */
router.get('/:fileId', fileController.getFile.bind(fileController));

/**
 * @swagger
 * /files/{fileId}/info:
 *   get:
 *     summary: Get file metadata
 *     description: Get file information without downloading
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileMetadata'
 *       404:
 *         description: File not found
 */
router.get('/:fileId/info', fileController.getFileInfo.bind(fileController));

/**
 * @swagger
 * /files/{fileId}:
 *   delete:
 *     summary: Delete a file
 *     description: Remove a file from storage
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
router.delete('/:fileId', fileController.deleteFile.bind(fileController));

/**
 * @swagger
 * /files:
 *   get:
 *     summary: List all files
 *     description: Get a list of all uploaded files with optional filtering
 *     tags: [Files]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, pdf, video]
 *         description: Filter by file type
 *     responses:
 *       200:
 *         description: List of files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FileMetadata'
 *                 count:
 *                   type: number
 */
router.get('/', fileController.listFiles.bind(fileController));

/**
 * @swagger
 * /files/{fileId}/metadata:
 *   put:
 *     summary: Update file metadata
 *     description: Update category and tags for a file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Metadata updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 file:
 *                   $ref: '#/components/schemas/FileMetadata'
 *       404:
 *         description: File not found
 */
router.put('/:fileId/metadata', fileController.updateFileMetadata.bind(fileController));

export default router;