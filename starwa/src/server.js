import path from 'node:path';
import url from 'node:url';
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import vacaturesRoutes from './routes/v1/vacatures.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// Static files
app.use(express.static(path.resolve(__dirname, '../public')));

// API routes
app.use('/api/v1/vacatures', vacaturesRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[starwa] Server listening on http://localhost:${PORT}`);
});

