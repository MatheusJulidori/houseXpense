import { Tag } from '../entities/tag';

export interface TagRepository {
  save(tag: Tag): Promise<Tag>;
  findAllByUser(userId: string): Promise<Tag[]>;
  findByIdForUser(id: string, userId: string): Promise<Tag | null>;
  findByNameForUser(name: string, userId: string): Promise<Tag | null>;
  findOrCreateMany(userId: string, names: string[]): Promise<Tag[]>;
}

export const TagRepositoryToken = Symbol('TagRepositoryToken');
