import { Request, Response } from 'express';
import { prisma } from '../db/client.js';
import { ApiError } from '../middlewares/errorHandler.js';
import type { SendMessageDTO, Message as MessageType } from '@diario/types';

export async function listMessages(
    req: Request<{ conversationId: string }>,
    res: Response,
) {
    const { conversationId } = req.params;
    const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
    });
    if (!conv) throw new ApiError(404, 'Conversation not found');
    const items = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
    });

    const msgIds = items.map((m) => m.id);
    const files = await prisma.file.findMany({
        where: { conversationId, messageId: { in: msgIds } },
        select: { id: true, messageId: true },
    });
    const grouped = files.reduce<Record<string, string[]>>((acc, f) => {
        if (!f.messageId) return acc;
        acc[f.messageId] = acc[f.messageId] || [];
        acc[f.messageId].push(f.id);
        return acc;
    }, {});

    const mapped: MessageType[] = items.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role as any,
        content: m.content,
        type: m.type as any,
        fileIds: grouped[m.id] || [],
        createdAt: m.createdAt.toISOString(),
    }));
    res.json(mapped);
}

export async function sendMessage(
    req: Request<unknown, unknown, SendMessageDTO>,
    res: Response,
) {
    const { conversationId, role, content, type } = req.body;
    const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
    });
    if (!conv) throw new ApiError(404, 'Conversation not found');
    const message = await prisma.message.create({
        data: { conversationId, role, content, type },
    });
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
    });
    const dto: MessageType = {
        id: message.id,
        conversationId: message.conversationId,
        role: message.role as any,
        content: message.content,
        type: message.type as any,
        fileIds: [],
        createdAt: message.createdAt.toISOString(),
    };
    res.status(201).json(dto);
}
