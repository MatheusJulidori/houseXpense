// Tag types
export interface Tag {
    id: string;
    name: string;
    movements?: Movement[];
}

export interface CreateTagRequest {
    name: string;
}

// Re-export Movement type for tag relationships
import type { Movement } from './movement.types';
