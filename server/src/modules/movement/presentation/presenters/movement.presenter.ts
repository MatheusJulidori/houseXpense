import { plainToInstance } from 'class-transformer';
import type { Movement } from '../../domain/entities/movement';
import { MovementResponseDto } from '../dto/movement-response.dto';

export class MovementPresenter {
  static toResponse(entity: Movement): MovementResponseDto {
    const snapshot = entity.toJSON();

    const payload = {
      ...snapshot,
      date: snapshot.date.toISOString().split('T')[0],
      userId: snapshot.userId,
      amount: snapshot.amount,
      tags: snapshot.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })),
    };

    return plainToInstance(MovementResponseDto, payload, {
      excludeExtraneousValues: true,
    });
  }

  static toResponseList(entities: Movement[]): MovementResponseDto[] {
    return entities.map((movement) => this.toResponse(movement));
  }
}
