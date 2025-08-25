import type {
    Conversation,
    CreateConversationDTO,
    UpdateConversationDTO,
    Message,
    SendMessageDTO,
    FileMeta,
} from '@diario/types';

const base = '/api';

async function json<T>(res: Response): Promise<T> {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export const api = {
    async getConversations(): Promise<Conversation[]> {
        const res = await fetch(`${base}/conversations`);
        return json(res);
    },
    async createConversation(
        data: CreateConversationDTO,
    ): Promise<Conversation> {
        const res = await fetch(`${base}/conversations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return json(res);
    },
    async getMessages(conversationId: string): Promise<Message[]> {
        const res = await fetch(
            `${base}/messages/by-conversation/${conversationId}`,
        );
        return json(res);
    },
    async sendMessage(body: SendMessageDTO): Promise<Message> {
        const res = await fetch(`${base}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return json(res);
    },
    async updateConversation(
        id: string,
        body: UpdateConversationDTO,
    ): Promise<Conversation> {
        const res = await fetch(`${base}/conversations/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return json(res);
    },
    async uploadFile(conversationId: string, file: File): Promise<Response> {
        const form = new FormData();
        form.append('conversationId', conversationId);
        form.append('file', file);
        const res = await fetch(`${base}/files/upload`, {
            method: 'POST',
            body: form,
        });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        return res;
    },
    async listFiles(conversationId: string): Promise<FileMeta[]> {
        const res = await fetch(
            `${base}/files/by-conversation/${conversationId}`,
        );
        return json(res);
    },
    getFileUrl(fileId: string, download = false) {
        const url = `${base}/files/${fileId}`;
        return download ? `${url}?download=1` : url;
    },
};
