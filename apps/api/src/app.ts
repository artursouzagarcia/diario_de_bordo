import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { router } from './routes/index.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import path from 'node:path';

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use((pinoHttp as unknown as () => any)());
    // Static serving for uploads (optional)
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const absUpload = path.resolve(process.cwd(), uploadDir);
    app.use('/uploads', express.static(absUpload));

    app.use('/api', router);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
