// Tag types
export interface Tag {
    id: string;
    name: string;
    userId: string;
    createdAt: string;
}

export interface CreateTagRequest {
    name: string;
}

