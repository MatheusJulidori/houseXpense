import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MovementType } from '../../domain/value-objects/movement-type';
import { TagResponseDto } from '../../../tag/presentation/dto/tag-response.dto';

const tagResponseDtoType = (): typeof TagResponseDto => TagResponseDto;

export class MovementResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty({ enum: MovementType })
  @Expose()
  type: MovementType;

  @ApiProperty({
    description: 'Movement date in YYYY-MM-DD format',
    example: '2025-10-26',
  })
  @Expose()
  date: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty({ type: Number })
  @Expose()
  amount: number;

  @ApiProperty({ description: 'Identifier of the owning user' })
  @Expose()
  userId: string;

  @ApiProperty({ type: tagResponseDtoType, isArray: true })
  @Expose()
  tags: TagResponseDto[];

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
