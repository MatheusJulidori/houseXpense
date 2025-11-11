import { plainToInstance } from 'class-transformer';
import type { Tag } from '../../domain/entities/tag';
import { TagResponseDto } from '../dto/tag-response.dto';

export class TagPresenter {
  static toResponse(entity: Tag): TagResponseDto {
    const snapshot = entity.toJSON();
    return plainToInstance(
      TagResponseDto,
      {
        id: snapshot.id,
        name: snapshot.name,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  static toResponseList(entities: Tag[]): TagResponseDto[] {
    return entities.map((tag) => this.toResponse(tag));
  }
}
