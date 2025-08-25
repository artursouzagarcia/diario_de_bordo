export type ID = string;

export interface FileMeta {
    id: ID;
    conversationId: ID;
    name: string;
    mimeType: string;
    size: number;
    url?: string; // opcional: pode ser um path local ou URL externa
    createdAt: string; // ISO
}

export interface Message {
    id: ID;
    conversationId: ID;
    role: 'user' | 'assistant' | 'system';
    content: string;
    type: 'text' | 'audio' | 'file';
    fileIds?: ID[]; // anexos vinculados
    createdAt: string; // ISO
}

export interface ConversationSummary {
    id: ID;
    conversationId: ID;
    summary: string;
    createdAt: string; // ISO
    updatedAt: string; // ISO
}

export interface Conversation {
    id: ID;
    title: string;
    createdAt: string; // ISO
    updatedAt: string; // ISO
    lastMessageAt?: string; // ISO
}

export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface CreateConversationDTO {
    title?: string;
}

export interface UpdateConversationDTO {
    title: string;
}

export interface SendMessageDTO {
    conversationId: ID;
    role: Message['role'];
    content: string;
    type: Message['type'];
    fileIds?: ID[];
}

export interface CreateFileDTO {
    conversationId: ID;
    name: string;
    mimeType: string;
    size: number;
    url?: string;
}

export interface UploadFileResponse {
    file: FileMeta;
    message: Message;
}
