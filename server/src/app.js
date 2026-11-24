import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import authRoutes from './routes/auth.routes.js';
import readingsRoutes from './routes/readings.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Build the Express app. Exported separately from the server so tests can
// import it without opening a port.
export function createApp() {
  const app = express();

  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/readings', readingsRoutes);
  app.use('/api/reports', reportsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
