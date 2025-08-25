import { Router } from 'express';
import conversations from './modules/conversations.routes.js';
import messages from './modules/messages.routes.js';
import files from './modules/files.routes.js';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

router.use('/conversations', conversations);
router.use('/messages', messages);
router.use('/files', files);
