import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  MovementRepository,
  MovementRepositoryToken,
} from '../../domain/ports/movement.repository';
import {
  UserRepository,
  UserRepositoryToken,
} from '../../../auth/domain/ports/user.repository';
import { TagService } from '../../../tag/application/tag.service';
import { Movement } from '../../domain/entities/movement';
import { MovementType } from '../../domain/value-objects/movement-type';
import {
  parseUtcDate,
  toLocalDateString,
} from '../../domain/utils/movement-date.util';

export interface CreateMovementInput {
  userId: string;
  description: string;
  type: MovementType;
  amount: number;
  tags?: string[];
  date?: string;
}

@Injectable()
export class CreateMovementUseCase {
  constructor(
    @Inject(MovementRepositoryToken)
    private readonly movementRepository: MovementRepository,
    private readonly tagService: TagService,
    @Inject(UserRepositoryToken)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CreateMovementInput): Promise<Movement> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tags =
      input.tags && input.tags.length > 0
        ? await this.tagService.findOrCreate(input.tags)
        : [];

    const date = this.resolveDate(input.date);

    const movement = Movement.create({
      id: randomUUID(),
      type: input.type,
      date,
      description: input.description,
      amount: input.amount,
      userId: input.userId,
      tags: tags.map((tag) => {
        const snapshot = tag.toJSON();
        return {
          id: snapshot.id,
          name: snapshot.name,
        };
      }),
      createdAt: new Date(),
    });

    return this.movementRepository.save(movement);
  }

  private resolveDate(date?: string): Date {
    if (!date) {
      return parseUtcDate(toLocalDateString(new Date()));
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return parseUtcDate(date);
    }

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return parseUtcDate(toLocalDateString(parsed));
  }
}
