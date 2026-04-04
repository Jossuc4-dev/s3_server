import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SMART File Storage API',
      version: '1.0.0',
      description: 'API de stockage de fichiers style S3 pour images, PDFs et vidéos avec accès public',
      contact: {
        name: 'SMART Backend Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:9000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        FileMetadata: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            originalName: { type: 'string' },
            fileName: { type: 'string' },
            fileType: { type: 'string', enum: ['image', 'pdf', 'video'] },
            mimeType: { type: 'string' },
            size: { type: 'number' },
            path: { type: 'string' },
            url: { type: 'string', description: 'API URL to access file' },
            publicUrl: { type: 'string', description: 'Public direct URL to access file' },
            uploadDate: { type: 'string', format: 'date-time' },
            category: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
        UploadResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            file: { $ref: '#/components/schemas/FileMetadata' },
            files: {
              type: 'array',
              items: { $ref: '#/components/schemas/FileMetadata' },
            },
            error: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);