import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { FileMetadata, FileCategory } from '../types/index.ts';
import { determineFileType, generateFilePath } from '../utils/fileUtils.ts';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const BASE_URL = process.env.BASE_URL || 'http://localhost:9000';
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:9000';

export class StorageService {
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  async saveFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    category?: string,
    tags?: string[]
  ): Promise<FileMetadata> {
    const fileType = determineFileType(mimeType);
    const fileId = uuidv4();
    const extension = path.extname(originalName);
    const fileName = `${fileId}${extension}`;
    const relativePath = generateFilePath(fileType, fileName);
    const fullPath = path.join(UPLOAD_DIR, relativePath);
    const directory = path.dirname(fullPath);

    await this.ensureDirectoryExists(directory);
    await fs.writeFile(fullPath, fileBuffer);

    const fileMetadata: FileMetadata = {
      id: fileId,
      originalName,
      fileName,
      fileType,
      mimeType,
      size: fileBuffer.length,
      path: relativePath,
      url: `${BASE_URL}/api/files/${fileId}`,
      publicUrl: `${PUBLIC_URL}/public/${relativePath}`,  // URL publique directe
      uploadDate: new Date(),
      category: category || getDefaultCategory(fileType),
      tags: tags || [],
    };

    await this.saveMetadata(fileMetadata);
    return fileMetadata;
  }

  async saveMultipleFiles(
    files: Array<{ buffer: Buffer; originalName: string; mimeType: string }>,
    category?: string,
    tags?: string[]
  ): Promise<FileMetadata[]> {
    const savedFiles: FileMetadata[] = [];
    for (const file of files) {
      const savedFile = await this.saveFile(
        file.buffer,
        file.originalName,
        file.mimeType,
        category,
        tags
      );
      savedFiles.push(savedFile);
    }
    return savedFiles;
  }

  async getFile(filePath: string): Promise<{ buffer: Buffer; metadata: FileMetadata }> {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    const metadata = await this.getMetadataByPath(filePath);
    
    if (!metadata) {
      throw new Error('File not found');
    }

    const buffer = await fs.readFile(fullPath);
    return { buffer, metadata };
  }

  async getFileById(fileId: string): Promise<{ buffer: Buffer; metadata: FileMetadata }> {
    const metadata = await this.getMetadataById(fileId);
    if (!metadata) {
      throw new Error('File not found');
    }
    return this.getFile(metadata.path);
  }

  async getFileByPublicPath(publicPath: string): Promise<{ buffer: Buffer; metadata: FileMetadata }> {
    // Extraire le chemin relatif de l'URL publique
    const relativePath = publicPath.replace(/^\/public\//, '');
    const fullPath = path.join(UPLOAD_DIR, relativePath);
    
    // Chercher les métadonnées par chemin
    const allMetadata = await this.getAllMetadata();
    const metadata = allMetadata.find(m => m.path === relativePath);
    
    if (!metadata) {
      throw new Error('File not found');
    }

    const buffer = await fs.readFile(fullPath);
    return { buffer, metadata };
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const metadata = await this.getMetadataById(fileId);
    if (!metadata) {
      return false;
    }

    const fullPath = path.join(UPLOAD_DIR, metadata.path);
    try {
      await fs.unlink(fullPath);
      await this.deleteMetadata(fileId);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async listFiles(fileType?: 'image' | 'pdf' | 'video'): Promise<FileMetadata[]> {
    const allMetadata = await this.getAllMetadata();
    if (fileType) {
      return allMetadata.filter(m => m.fileType === fileType);
    }
    return allMetadata;
  }

  async updateMetadata(
    fileId: string,
    updates: { category?: string; tags?: string[] }
  ): Promise<FileMetadata | null> {
    const metadata = await this.getMetadataById(fileId);
    if (!metadata) {
      return null;
    }

    if (updates.category) metadata.category = updates.category;
    if (updates.tags) metadata.tags = updates.tags;

    await this.saveMetadata(metadata);
    return metadata;
  }

  private async saveMetadata(metadata: FileMetadata): Promise<void> {
    const metadataDir = path.join(UPLOAD_DIR, '.metadata');
    await this.ensureDirectoryExists(metadataDir);
    const metadataPath = path.join(metadataDir, `${metadata.id}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async getMetadataById(fileId: string): Promise<FileMetadata | null> {
    const metadataPath = path.join(UPLOAD_DIR, '.metadata', `${fileId}.json`);
    try {
      const data = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async getMetadataByPath(filePath: string): Promise<FileMetadata | null> {
    const allMetadata = await this.getAllMetadata();
    return allMetadata.find(m => m.path === filePath) || null;
  }

  private async getAllMetadata(): Promise<FileMetadata[]> {
    const metadataDir = path.join(UPLOAD_DIR, '.metadata');
    try {
      await this.ensureDirectoryExists(metadataDir);
      const files = await fs.readdir(metadataDir);
      const metadataList: FileMetadata[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const data = await fs.readFile(path.join(metadataDir, file), 'utf-8');
          metadataList.push(JSON.parse(data));
        }
      }
      
      return metadataList.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
    } catch {
      return [];
    }
  }

  private async deleteMetadata(fileId: string): Promise<void> {
    const metadataPath = path.join(UPLOAD_DIR, '.metadata', `${fileId}.json`);
    try {
      await fs.unlink(metadataPath);
    } catch (error) {
      console.error('Error deleting metadata:', error);
    }
  }
}

function getDefaultCategory(fileType: 'image' | 'pdf' | 'video'): string {
  switch (fileType) {
    case 'image':
      return 'images';
    case 'pdf':
      return 'documents';
    case 'video':
      return 'videos';
    default:
      return 'others';
  }
}

export const storageService = new StorageService();