import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateTagDto } from '../presentation/dto/create-tag.dto';
import {
  TagRepository,
  TagRepositoryToken,
} from '../domain/ports/tag.repository';
import { Tag } from '../domain/entities/tag';

@Injectable()
export class TagService {
  constructor(
    @Inject(TagRepositoryToken)
    private readonly tagRepository: TagRepository,
  ) {}

  async create(createTagDto: CreateTagDto, userId: string): Promise<Tag> {
    const normalizedName = Tag.normalizeName(createTagDto.name);

    const existingTag = await this.tagRepository.findByNameForUser(
      normalizedName,
      userId,
    );

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    const tag = Tag.create({
      id: randomUUID(),
      name: normalizedName,
      userId,
      createdAt: new Date(),
    });

    return this.tagRepository.save(tag);
  }

  async findAll(userId: string): Promise<Tag[]> {
    return this.tagRepository.findAllByUser(userId);
  }

  async findOne(id: string, userId: string): Promise<Tag> {
    const tag = await this.tagRepository.findByIdForUser(id, userId);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async findByName(name: string, userId: string): Promise<Tag | null> {
    return this.tagRepository.findByNameForUser(name, userId);
  }

  async findOrCreate(tagNames: string[], userId: string): Promise<Tag[]> {
    const normalizedNames = tagNames
      .map((name) => Tag.normalizeName(name))
      .filter((name) => name.length > 0);

    if (normalizedNames.length === 0) {
      return [];
    }

    return this.tagRepository.findOrCreateMany(userId, normalizedNames);
  }
}
