import { plainToInstance } from 'class-transformer';
import { Tag } from '../../../entities/tag.entity';
import { TagResponseDto } from '../dto/tag-response.dto';

export class TagPresenter {
  static toResponse(entity: Tag): TagResponseDto {
    return plainToInstance(TagResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static toResponseList(entities: Tag[]): TagResponseDto[] {
    return entities.map((tag) => this.toResponse(tag));
  }
}
