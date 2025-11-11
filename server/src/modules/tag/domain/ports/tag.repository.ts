import { Tag } from '../entities/tag';

export interface TagRepository {
  save(tag: Tag): Promise<Tag>;
  findAll(): Promise<Tag[]>;
  findById(id: string): Promise<Tag | null>;
  findByName(name: string): Promise<Tag | null>;
  findOrCreateMany(names: string[]): Promise<Tag[]>;
}

export const TagRepositoryToken = Symbol('TagRepositoryToken');
