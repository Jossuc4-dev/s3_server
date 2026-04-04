import { Router } from 'express';
import { fileController } from '../controller/fileController.ts';

const router = Router();

/**
 * @swagger
 * /public/{fileType}/{fileName}:
 *   get:
 *     summary: Public access to files
 *     description: Direct public access to uploaded files (no authentication required)
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: fileType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [images, pdfs, videos]
 *         description: Type of file (images, pdfs, or videos)
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: File name with extension
 *     responses:
 *       200:
 *         description: File content
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 */
router.get('/:fileType/:fileName', fileController.getPublicFile.bind(fileController));

export default router;