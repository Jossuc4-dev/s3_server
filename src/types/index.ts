export interface FileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'video';
  mimeType: string;
  size: number;
  path: string;
  url: string;
  publicUrl: string;  // Nouveau champ pour l'URL publique
  uploadDate: Date;
  category?: string;
  tags?: string[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file?: FileMetadata;
  files?: FileMetadata[];
  error?: string;
}

export type FileCategory = 'images' | 'pdfs' | 'videos';