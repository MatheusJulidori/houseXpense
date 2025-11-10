import { api } from './api';
import type { Tag, CreateTagRequest } from '../types/tag.types';

export const tagsService = {
    // Get all tags
    getTags: async (): Promise<Tag[]> => {
        return api.get<Tag[]>('/tags');
    },

    // Get tag by ID
    getTag: async (id: string): Promise<Tag> => {
        return api.get<Tag>(`/tags/${id}`);
    },

    // Create new tag
    createTag: async (data: CreateTagRequest): Promise<Tag> => {
        return api.post<Tag>('/tags', data);
    },

    // Find or create tags (helper function)
    findOrCreateTags: async (tagNames: string[]): Promise<Tag[]> => {
        const existingTags = await tagsService.getTags();
        const existingTagNames = new Set(existingTags.map(tag => tag.name));
        const newTagNames = tagNames.filter(name => !existingTagNames.has(name));

        // Create new tags
        const newTags = await Promise.all(
            newTagNames.map(name => tagsService.createTag({ name }))
        );

        // Combine existing and new tags
        const allTags = [...existingTags, ...newTags];
        return allTags.filter(tag => tagNames.includes(tag.name));
    },
};
