import { Request, Response } from 'express';
import { prisma } from '../db/client.js';
import type { CreateFileDTO } from '@diario/types';
import path from 'node:path';
import fs from 'node:fs';
import { ApiError } from '../middlewares/errorHandler.js';

export async function listFiles(
    req: Request<{ conversationId: string }>,
    res: Response,
) {
    const { conversationId } = req.params;
    const items = await prisma.file.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
    });
    const mapped = items.map((f) => ({
        id: f.id,
        conversationId: f.conversationId,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size,
        url: `/api/files/${f.id}`,
        createdAt: f.createdAt.toISOString(),
    }));
    res.json(mapped);
}

export async function uploadFile(req: Request, res: Response) {
    const file = req.file;
    const { conversationId } = req.body as CreateFileDTO;
    if (!file) return res.status(400).json({ error: 'No file' });
    // Ensure conversation exists
    const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
    });
    if (!conv) throw new ApiError(404, 'Conversation not found');

    // Create the file and a corresponding message (type=file)
    const created = await prisma.file.create({
        data: {
            conversationId,
            name: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: file.path,
        },
    });

    const message = await prisma.message.create({
        data: {
            conversationId,
            role: 'user',
            content: created.name,
            type: 'file',
            files: { connect: { id: created.id } },
        },
    });

    await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
    });

    res.status(201).json({
        file: {
            id: created.id,
            conversationId: created.conversationId,
            name: created.name,
            mimeType: created.mimeType,
            size: created.size,
            url: `/api/files/${created.id}`,
            createdAt: created.createdAt.toISOString(),
        },
        message: {
            id: message.id,
            conversationId: message.conversationId,
            role: message.role as any,
            content: message.content,
            type: message.type as any,
            fileIds: [created.id],
            createdAt: message.createdAt.toISOString(),
        },
    });
}

export async function getFileById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const f = await prisma.file.findUnique({ where: { id } });
    if (!f) throw new ApiError(404, 'File not found');
    const filePath = f.url ? path.resolve(process.cwd(), f.url) : null;
    if (!filePath || !fs.existsSync(filePath)) {
        throw new ApiError(404, 'File content not found');
    }
    const isDownload =
        String(req.query.download || '').toLowerCase() === '1' ||
        String(req.query.d || '').toLowerCase() === '1';
    res.setHeader('Content-Type', f.mimeType);
    res.setHeader(
        'Content-Disposition',
        `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(f.name)}"`,
    );
    fs.createReadStream(filePath).pipe(res);
}

export async function getFileMeta(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const f = await prisma.file.findUnique({ where: { id } });
    if (!f) throw new ApiError(404, 'File not found');
    res.json({
        id: f.id,
        conversationId: f.conversationId,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size,
        url: `/api/files/${f.id}`,
        createdAt: f.createdAt.toISOString(),
    });
}
