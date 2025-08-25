import { Router } from 'express';
import multer from 'multer';
import * as ctrl from '../../controllers/files.controller.js';

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const upload = multer({ dest: uploadDir });

const r = Router();

r.get('/by-conversation/:conversationId', ctrl.listFiles);
r.post('/upload', upload.single('file'), ctrl.uploadFile);
r.get('/:id', ctrl.getFileById);
r.get('/:id/meta', ctrl.getFileMeta);

export default r;
