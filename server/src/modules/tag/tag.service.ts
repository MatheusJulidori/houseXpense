import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const { name } = createTagDto;
    const normalizedName = name.toLowerCase();

    // Check if tag already exists
    const existingTag = await this.tagRepository.findOne({
      where: { name: normalizedName },
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    const tag = this.tagRepository.create({ name: normalizedName });
    return this.tagRepository.save(tag);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.tagRepository.findOne({
      where: { name: name.toLowerCase() },
    });
  }

  async findOrCreate(tagNames: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];

    for (const name of tagNames) {
      const normalizedName = name.toLowerCase();
      let tag = await this.findByName(normalizedName);

      if (!tag) {
        tag = this.tagRepository.create({ name: normalizedName });
        tag = await this.tagRepository.save(tag);
      }

      tags.push(tag);
    }

    return tags;
  }
}
