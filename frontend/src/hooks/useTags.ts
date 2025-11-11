import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tagsService } from '../services/tags.service';
import type { CreateTagRequest } from '../types/tag.types';

// Query keys
export const tagKeys = {
    all: ['tags'] as const,
    lists: () => [...tagKeys.all, 'list'] as const,
    details: () => [...tagKeys.all, 'detail'] as const,
    detail: (id: string) => [...tagKeys.details(), id] as const,
};

// Hook to get all tags
export const useTags = () => {
    return useQuery({
        queryKey: tagKeys.lists(),
        queryFn: () => tagsService.getTags(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to get a single tag
export const useTag = (id: string) => {
    return useQuery({
        queryKey: tagKeys.detail(id),
        queryFn: () => tagsService.getTag(id),
        enabled: !!id,
    });
};

// Hook to create tag
export const useCreateTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTagRequest) => tagsService.createTag(data),
        onSuccess: () => {
            // Invalidate and refetch tags
            void queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
        },
    });
};

// Hook to find or create multiple tags
export const useFindOrCreateTags = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tagNames: string[]) => tagsService.findOrCreateTags(tagNames),
        onSuccess: () => {
            // Invalidate and refetch tags
            void queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
        },
    });
};

// Hook for tag statistics
export const useTagStats = () => {
    const { data: tags, isLoading, error } = useTags();

    const stats = tags
        ? {
              totalTags: tags.length,
              mostUsedTags: tags.map((tag) => ({
                  ...tag,
                  usageCount: 0,
              })),
              unusedTags: [...tags],
          }
        : null;

    return {
        stats,
        isLoading,
        error,
    };
};
