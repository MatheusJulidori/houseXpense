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

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const normalizedName = Tag.normalizeName(createTagDto.name);

    const existingTag = await this.tagRepository.findByName(normalizedName);

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    const tag = Tag.create({
      id: randomUUID(),
      name: normalizedName,
      createdAt: new Date(),
    });

    return this.tagRepository.save(tag);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.findAll();
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.tagRepository.findByName(name);
  }

  async findOrCreate(tagNames: string[]): Promise<Tag[]> {
    const normalizedNames = tagNames
      .map((name) => Tag.normalizeName(name))
      .filter((name) => name.length > 0);

    if (normalizedNames.length === 0) {
      return [];
    }

    return this.tagRepository.findOrCreateMany(normalizedNames);
  }
}
