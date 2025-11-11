import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { MovementRepository } from '../../domain/ports/movement.repository';
import { Movement as MovementDomain } from '../../domain/entities/movement';
import { MovementOrmEntity } from '../entities/movement.orm-entity';
import { TagOrmEntity } from '../../../tag/infrastructure/entities/tag.orm-entity';
import { UserOrmEntity } from '../../../auth/infrastructure/entities/user.orm-entity';

@Injectable()
export class MovementTypeormRepository implements MovementRepository {
  constructor(
    @InjectRepository(MovementOrmEntity)
    private readonly movementRepository: Repository<MovementOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private toDomain(entity: MovementOrmEntity): MovementDomain {
    const amount =
      typeof entity.amount === 'string'
        ? Number.parseFloat(entity.amount)
        : entity.amount;

    return MovementDomain.create({
      id: entity.id,
      type: entity.type,
      date: entity.date,
      description: entity.description,
      amount,
      userId: entity.user?.id ?? '',
      tags:
        entity.tags?.map((tag) => ({
          id: tag.id,
          name: tag.name,
        })) ?? [],
      createdAt: entity.createdAt,
    });
  }

  async save(movement: MovementDomain): Promise<MovementDomain> {
    const snapshot = movement.toJSON();
    return this.dataSource.transaction(async (manager) => {
      const movementRepo = manager.getRepository(MovementOrmEntity);
      const userRepo = manager.getRepository(UserOrmEntity);
      const tagRepo = manager.getRepository(TagOrmEntity);

      const user = await userRepo.findOne({
        where: { id: snapshot.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const tags =
        snapshot.tags.length > 0
          ? await tagRepo.find({
              where: {
                id: In(snapshot.tags.map((tag) => tag.id)),
                userId: snapshot.userId,
              },
            })
          : [];

      let entity = await movementRepo.findOne({
        where: { id: snapshot.id, user: { id: snapshot.userId } },
        relations: ['user', 'tags'],
      });

      if (!entity) {
        entity = movementRepo.create({ id: snapshot.id });
        entity.createdAt = snapshot.createdAt;
      }

      entity.type = snapshot.type;
      entity.date = snapshot.date;
      entity.description = snapshot.description;
      entity.amount = snapshot.amount;
      entity.user = user;
      entity.tags = tags;

      await movementRepo.save(entity);

      const persisted = await movementRepo.findOne({
        where: { id: entity.id },
        relations: ['user', 'tags'],
      });

      if (!persisted) {
        throw new NotFoundException('Movement not persisted');
      }

      return this.toDomain(persisted);
    });
  }

  async findById(id: string, userId: string): Promise<MovementDomain | null> {
    const movement = await this.movementRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user', 'tags'],
    });
    return movement ? this.toDomain(movement) : null;
  }

  async findAllByUser(
    userId: string,
    tagNames?: string[],
  ): Promise<MovementDomain[]> {
    const queryBuilder = this.movementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.tags', 'tag')
      .leftJoinAndSelect('movement.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('movement.date', 'DESC')
      .addOrderBy('movement.created_at', 'DESC');

    if (tagNames && tagNames.length > 0) {
      const normalizedTagNames = tagNames.map((name) => name.toLowerCase());
      queryBuilder.andWhere('tag.name IN (:...tagNames)', {
        tagNames: normalizedTagNames,
      });
    }

    const movements = await queryBuilder.getMany();
    return movements.map((movement) => this.toDomain(movement));
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const movementRepo = manager.getRepository(MovementOrmEntity);
      const existing = await movementRepo.findOne({
        where: { id, user: { id: userId } },
      });
      if (!existing) {
        return;
      }
      await movementRepo.delete({ id });
    });
  }
}
