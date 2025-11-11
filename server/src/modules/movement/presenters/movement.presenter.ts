import { plainToInstance } from 'class-transformer';
import { Movement } from '../../../entities/movement.entity';
import { MovementResponseDto } from '../dto/movement-response.dto';

export class MovementPresenter {
  static toResponse(entity: Movement): MovementResponseDto {
    return plainToInstance(MovementResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static toResponseList(entities: Movement[]): MovementResponseDto[] {
    return entities.map((movement) => this.toResponse(movement));
  }
}
