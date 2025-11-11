import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movement } from '../../entities/movement.entity';
import { User } from '../../entities/user.entity';
import { CreateMovementDto } from './dto/create-movement.dto';
import { TagService } from '../tag/tag.service';
import { Tag } from '../../entities/tag.entity';
import { UpdateMovementDto } from './dto/update-movement.dto';

@Injectable()
export class MovementService {
  constructor(
    @InjectRepository(Movement)
    private movementRepository: Repository<Movement>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private tagService: TagService,
  ) {}

  private formatDateYMD(date: Date): string {
    // convert a JS Date to YYYY-MM-DD in UTC-3
    const tzOffsetMin = 180; // 3 hours
    const utcMs = date.getTime() - tzOffsetMin * 60 * 1000;
    const shifted = new Date(utcMs);
    const y = shifted.getUTCFullYear();
    const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
    const d = String(shifted.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  async create(
    createMovementDto: CreateMovementDto,
    userId: string,
  ): Promise<Movement> {
    const { description, type, amount, tags, date } = createMovementDto;

    // Fetch user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Handle tags - find existing or create new ones

    let tagEntities: Tag[] = [];
    if (tags && tags.length > 0) {
      tagEntities = await this.tagService.findOrCreate(tags);
    }

    // Set date or use current date in UTC-3, stored as YYYY-MM-DD to avoid timezone drift
    const movementDateYMD =
      date && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? date
        : this.formatDateYMD(new Date());

    const movement = this.movementRepository.create({
      description,
      type,
      amount,
      // TypeORM accepts string for date column
      date: movementDateYMD as unknown as Date,
      user,
      tags: tagEntities,
    });

    return this.movementRepository.save(movement);
  }

  async findAll(userId: string, tagNames?: string[]): Promise<Movement[]> {
    const queryBuilder = this.movementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.tags', 'tag')
      .leftJoinAndSelect('movement.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('movement.date', 'DESC')
      .addOrderBy('movement.createdAt', 'DESC');

    if (tagNames && tagNames.length > 0) {
      // Filter by tags - movements that have at least one of the specified tags
      const normalizedTagNames = tagNames.map((name) => name.toLowerCase());
      queryBuilder.andWhere('tag.name IN (:...tagNames)', {
        tagNames: normalizedTagNames,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, userId: string): Promise<Movement> {
    const movement = await this.movementRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['tags', 'user'],
    });

    if (!movement) {
      throw new NotFoundException('Movement not found');
    }

    return movement;
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateMovementDto,
  ): Promise<Movement> {
    const movement = await this.findOne(id, userId);

    if (typeof updateDto.description === 'string') {
      movement.description = updateDto.description;
    }
    if (typeof updateDto.type === 'string') {
      movement.type = updateDto.type as any;
    }
    if (typeof updateDto.amount === 'number') {
      // TypeORM decimal can map to string, cast carefully
      movement.amount = updateDto.amount as any;
    }
    if (typeof updateDto.date === 'string') {
      const ymd = /^\d{4}-\d{2}-\d{2}$/.test(updateDto.date)
        ? updateDto.date
        : this.formatDateYMD(new Date(updateDto.date));
      movement.date = ymd as unknown as Date;
    }
    if (updateDto.tags) {
      const tagEntities = await this.tagService.findOrCreate(updateDto.tags);
      movement.tags = tagEntities;
    }

    return this.movementRepository.save(movement);
  }

  async remove(id: string, userId: string): Promise<void> {
    const movement = await this.findOne(id, userId);
    await this.movementRepository.remove(movement);
  }
}
