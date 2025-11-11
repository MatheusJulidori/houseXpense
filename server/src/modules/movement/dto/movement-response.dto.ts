import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import type { Movement } from '../../../entities/movement.entity';
import { MovementType } from '../../../entities/movement.entity';
import { TagResponseDto } from '../../tag/dto/tag-response.dto';

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
  @Transform(({ value }: { value: Date | string }) =>
    value instanceof Date ? value.toISOString().split('T')[0] : value,
  )
  @Expose()
  date: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty({ type: Number })
  @Transform(({ value }: { value: number | string }) => Number(value))
  @Expose()
  amount: number;

  @ApiProperty({ description: 'Identifier of the owning user' })
  @Transform(({ obj }: { obj: Movement }) => obj.user?.id ?? null)
  @Expose()
  userId: string | null;

  @ApiProperty({ type: () => TagResponseDto, isArray: true })
  @Type(() => TagResponseDto)
  @Expose()
  tags: TagResponseDto[];

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
