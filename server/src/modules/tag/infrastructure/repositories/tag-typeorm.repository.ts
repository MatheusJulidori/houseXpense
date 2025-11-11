import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { TagRepository } from '../../domain/ports/tag.repository';
import { Tag as TagDomain } from '../../domain/entities/tag';
import { TagOrmEntity } from '../entities/tag.orm-entity';

@Injectable()
export class TagTypeormRepository implements TagRepository {
  constructor(
    @InjectRepository(TagOrmEntity)
    private readonly tagRepository: Repository<TagOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private toDomain(entity: TagOrmEntity): TagDomain {
    return TagDomain.create({
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt,
    });
  }

  async save(tag: TagDomain): Promise<TagDomain> {
    const snapshot = tag.toJSON();
    const entity = this.tagRepository.create({
      id: snapshot.id,
      name: snapshot.name,
    });

    const saved = await this.tagRepository.save(entity);
    return this.toDomain(saved);
  }

  async findAll(): Promise<TagDomain[]> {
    const tags = await this.tagRepository.find({
      order: { name: 'ASC' },
    });
    return tags.map((tag) => this.toDomain(tag));
  }

  async findById(id: string): Promise<TagDomain | null> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    return tag ? this.toDomain(tag) : null;
  }

  async findByName(name: string): Promise<TagDomain | null> {
    const tag = await this.tagRepository.findOne({
      where: { name: TagDomain.normalizeName(name) },
    });
    return tag ? this.toDomain(tag) : null;
  }

  async findOrCreateMany(names: string[]): Promise<TagDomain[]> {
    if (names.length === 0) {
      return [];
    }

    const uniqueNames = Array.from(
      new Set(names.map((name) => TagDomain.normalizeName(name))),
    );

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(TagOrmEntity);

      const existing = await repo.find({
        where: { name: In(uniqueNames) },
      });

      const byName = new Map(existing.map((tag) => [tag.name, tag]));

      const toCreate = uniqueNames
        .filter((name) => !byName.has(name))
        .map((name) => repo.create({ name }));

      if (toCreate.length > 0) {
        const saved = await repo.save(toCreate);
        for (const tag of saved) {
          byName.set(tag.name, tag);
        }
      }

      return uniqueNames.map((name) => {
        const entity = byName.get(name);
        if (!entity) {
          throw new Error(`Failed to load tag with name: ${name}`);
        }
        return this.toDomain(entity);
      });
    });
  }
}
