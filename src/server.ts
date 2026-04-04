import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import fileRoutes from './routes/fileRoutes.ts';
import publicRoutes from './routes/publicRoutes.ts';  // Nouvelle importation
import { errorHandler, notFound } from './middlewares/errorHandle.ts';
import { swaggerSpec } from './config/swagger.ts';

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads (alternative public access)
app.use('/public', express.static(path.join(process.cwd(), 'uploads')));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/files', fileRoutes);
app.use('/public', publicRoutes);  // Route publique directe

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;