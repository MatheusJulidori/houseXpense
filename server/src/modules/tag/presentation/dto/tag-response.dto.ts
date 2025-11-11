import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TagResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
