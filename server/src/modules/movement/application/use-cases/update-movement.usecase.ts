import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import {
  MovementRepository,
  MovementRepositoryToken,
} from '../../domain/ports/movement.repository';
import { Movement } from '../../domain/entities/movement';
import { MovementType } from '../../domain/value-objects/movement-type';
import { TagService } from '../../../tag/application/tag.service';
import {
  parseUtcDate,
  toLocalDateString,
} from '../../domain/utils/movement-date.util';

export interface UpdateMovementInput {
  id: string;
  userId: string;
  description?: string;
  type?: MovementType;
  amount?: number;
  tags?: string[];
  date?: string;
}

@Injectable()
export class UpdateMovementUseCase {
  constructor(
    @Inject(MovementRepositoryToken)
    private readonly movementRepository: MovementRepository,
    private readonly tagService: TagService,
  ) {}

  async execute(input: UpdateMovementInput): Promise<Movement> {
    const existing = await this.movementRepository.findById(
      input.id,
      input.userId,
    );

    if (!existing) {
      throw new NotFoundException('Movement not found');
    }

    const snapshot = existing.toJSON();

    const tags =
      input.tags && input.tags.length > 0
        ? (await this.tagService.findOrCreate(input.tags, input.userId)).map(
            (tag) => {
              const data = tag.toJSON();
              return {
                id: data.id,
                name: data.name,
              };
            },
          )
        : snapshot.tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
          }));

    const updated = Movement.create({
      ...snapshot,
      description:
        typeof input.description === 'string'
          ? input.description
          : snapshot.description,
      type: input.type ?? snapshot.type,
      amount: typeof input.amount === 'number' ? input.amount : snapshot.amount,
      date: this.resolveDate(input.date, snapshot.date),
      tags,
    });

    return this.movementRepository.save(updated);
  }

  private resolveDate(date: string | undefined, fallback: Date): Date {
    if (!date) {
      return fallback;
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
