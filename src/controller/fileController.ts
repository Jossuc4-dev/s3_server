import type { Request, Response } from 'express';
import { storageService } from '../services/storageService.ts';
import type { UploadResponse } from '../types/index.ts';
import path from 'path';

export class FileController {
  async uploadSingleFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' } as UploadResponse);
        return;
      }

      const { category, tags } = req.body;
      const tagsArray = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

      const fileMetadata = await storageService.saveFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        category,
        tagsArray
      );

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        file: fileMetadata,
      } as UploadResponse);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as UploadResponse);
    }
  }

  async uploadMultipleFiles(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400).json({ error: 'No files uploaded' } as UploadResponse);
        return;
      }

      const files = req.files as Express.Multer.File[];
      const { category, tags } = req.body;
      const tagsArray = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

      const filesData = files.map(file => ({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      }));

      const fileMetadataList = await storageService.saveMultipleFiles(filesData, category, tagsArray);

      res.status(201).json({
        success: true,
        message: `${files.length} files uploaded successfully`,
        files: fileMetadataList,
      } as UploadResponse);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading files',
        error: error instanceof Error ? error.message : 'Unknown error',
      } as UploadResponse);
    }
  }

  async getFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const { buffer, metadata } = await storageService.getFileById(fileId!);

      res.setHeader('Content-Type', metadata.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${metadata.originalName}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Get file error:', error);
      res.status(404).json({ error: 'File not found' });
    }
  }

  // Nouvelle méthode pour l'accès public direct
  async getPublicFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileType, fileName } = req.params;
      const publicPath = `${fileType}/${fileName}`;
      const { buffer, metadata } = await storageService.getFileByPublicPath(publicPath);

      res.setHeader('Content-Type', metadata.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${metadata.originalName}"`);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache d'un an
      res.send(buffer);
    } catch (error) {
      console.error('Get public file error:', error);
      res.status(404).send('File not found');
    }
  }

  async getFileInfo(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const { metadata } = await storageService.getFileById(fileId!);
      res.json(metadata);
    } catch (error) {
      console.error('Get file info error:', error);
      res.status(404).json({ error: 'File not found' });
    }
  }

  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const deleted = await storageService.deleteFile(fileId!);

      if (deleted) {
        res.json({ success: true, message: 'File deleted successfully' });
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Error deleting file' });
    }
  }

  async listFiles(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query;
      const fileType = type as 'image' | 'pdf' | 'video' | undefined;
      const files = await storageService.listFiles(fileType);
      res.json({ files, count: files.length });
    } catch (error) {
      console.error('List files error:', error);
      res.status(500).json({ error: 'Error listing files' });
    }
  }

  async updateFileMetadata(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const { category, tags } = req.body;

      const updated = await storageService.updateMetadata(fileId!, { category, tags });

      if (updated) {
        res.json({ success: true, message: 'Metadata updated successfully', file: updated });
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } catch (error) {
      console.error('Update metadata error:', error);
      res.status(500).json({ error: 'Error updating metadata' });
    }
  }
}

export const fileController = new FileController();