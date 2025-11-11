import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movement } from '../../entities/movement.entity';
import { User } from '../../entities/user.entity';
import { CreateMovementDto } from './dto/create-movement.dto';
import { TagService } from '../tag/tag.service';
import { Tag } from '../../entities/tag.entity';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { parseUtcDate, toLocalDateString } from './movement-date.util';

@Injectable()
export class MovementService {
  constructor(
    @InjectRepository(Movement)
    private movementRepository: Repository<Movement>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private tagService: TagService,
  ) {}

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
        : toLocalDateString(new Date());

    const movementDate = parseUtcDate(movementDateYMD);

    const movement = this.movementRepository.create({
      description,
      type,
      amount,
      date: movementDate,
      user,
      tags: tagEntities,
    });

    const savedMovement = await this.movementRepository.save(movement);
    return this.findOne(savedMovement.id, userId);
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
    if (updateDto.type) {
      movement.type = updateDto.type;
    }
    if (typeof updateDto.amount === 'number') {
      movement.amount = Number(updateDto.amount);
    }
    if (typeof updateDto.date === 'string') {
      const ymd = /^\d{4}-\d{2}-\d{2}$/.test(updateDto.date)
        ? updateDto.date
        : toLocalDateString(new Date(updateDto.date));
      movement.date = parseUtcDate(ymd);
    }
    if (updateDto.tags) {
      const tagEntities = await this.tagService.findOrCreate(updateDto.tags);
      movement.tags = tagEntities;
    }

    const savedMovement = await this.movementRepository.save(movement);
    return this.findOne(savedMovement.id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const movement = await this.findOne(id, userId);
    await this.movementRepository.remove(movement);
  }
}
