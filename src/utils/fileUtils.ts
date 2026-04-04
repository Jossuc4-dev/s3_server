import { type FileCategory } from '../types/index.ts';
import path from 'path';

export const determineFileType = (mimeType: string): 'image' | 'pdf' | 'video' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';
  throw new Error(`Unsupported file type: ${mimeType}`);
};

export const getCategoryFromType = (fileType: 'image' | 'pdf' | 'video'): FileCategory => {
  switch (fileType) {
    case 'image':
      return 'images';
    case 'pdf':
      return 'pdfs';
    case 'video':
      return 'videos';
    default:
      return 'images';
  }
};

export const generateFilePath = (fileType: 'image' | 'pdf' | 'video', fileName: string): string => {
  const category = getCategoryFromType(fileType);
  return path.join(category, fileName);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};