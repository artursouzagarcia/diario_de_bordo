import { Router } from 'express';
import * as ctrl from '../../controllers/conversations.controller.js';

const r = Router();

r.get('/', ctrl.listConversations);
r.post('/', ctrl.createConversation);
r.get('/:id', ctrl.getConversation);
r.patch('/:id', ctrl.updateConversation);
r.delete('/:id', ctrl.deleteConversation);

export default r;
