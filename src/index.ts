import app from './server.ts';
import fs from 'fs/promises';

const PORT = process.env.PORT || 9000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

async function initializeServer() {
  try {
    // Create uploads directory if it doesn't exist
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(path.join(UPLOAD_DIR, 'images'), { recursive: true });
    await fs.mkdir(path.join(UPLOAD_DIR, 'pdfs'), { recursive: true });
    await fs.mkdir(path.join(UPLOAD_DIR, 'videos'), { recursive: true });
    await fs.mkdir(path.join(UPLOAD_DIR, '.metadata'), { recursive: true });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
      console.log('\nAvailable endpoints:');
      console.log(`  POST   /api/files/upload - Upload single file`);
      console.log(`  POST   /api/files/upload-multiple - Upload multiple files`);
      console.log(`  GET    /api/files - List all files`);
      console.log(`  GET    /api/files/:fileId - Download file`);
      console.log(`  GET    /api/files/:fileId/info - Get file info`);
      console.log(`  PUT    /api/files/:fileId/metadata - Update metadata`);
      console.log(`  DELETE /api/files/:fileId - Delete file`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

import path from 'path';

initializeServer();