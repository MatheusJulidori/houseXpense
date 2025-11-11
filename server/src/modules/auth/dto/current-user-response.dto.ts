import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CurrentUserResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
