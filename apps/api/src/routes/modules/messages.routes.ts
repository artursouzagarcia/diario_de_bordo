import { Router } from 'express';
import * as ctrl from '../../controllers/messages.controller.js';

const r = Router();

r.get('/by-conversation/:conversationId', ctrl.listMessages);
r.post('/', ctrl.sendMessage);

export default r;
