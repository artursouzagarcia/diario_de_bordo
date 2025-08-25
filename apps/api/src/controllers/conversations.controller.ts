import { Request, Response } from 'express';
import { prisma } from '../db/client.js';
import { ApiError } from '../middlewares/errorHandler.js';
import type {
    CreateConversationDTO,
    UpdateConversationDTO,
} from '@diario/types';

export async function listConversations(_req: Request, res: Response) {
    const items = await prisma.conversation.findMany({
        orderBy: { updatedAt: 'desc' },
    });
    res.json(items);
}

export async function createConversation(
    req: Request<unknown, unknown, CreateConversationDTO>,
    res: Response,
) {
    const { title = '' } = req.body || {};
    const conv = await prisma.conversation.create({ data: { title } });
    res.status(201).json(conv);
}

export async function getConversation(
    req: Request<{ id: string }>,
    res: Response,
) {
    const { id } = req.params;
    const conv = await prisma.conversation.findUnique({ where: { id } });
    if (!conv) throw new ApiError(404, 'Conversation not found');
    res.json(conv);
}

export async function deleteConversation(
    req: Request<{ id: string }>,
    res: Response,
) {
    const { id } = req.params;
    await prisma.message.deleteMany({ where: { conversationId: id } });
    await prisma.file.deleteMany({ where: { conversationId: id } });
    await prisma.conversationSummary.deleteMany({
        where: { conversationId: id },
    });
    await prisma.conversation.delete({ where: { id } });
    res.status(204).send();
}

export async function updateConversation(
    req: Request<{ id: string }, unknown, UpdateConversationDTO>,
    res: Response,
) {
    const { id } = req.params;
    const { title } = req.body;
    if (!title?.trim()) throw new ApiError(400, 'Title is required');
    const updated = await prisma.conversation.update({
        where: { id },
        data: { title },
    });
    res.json(updated);
}
