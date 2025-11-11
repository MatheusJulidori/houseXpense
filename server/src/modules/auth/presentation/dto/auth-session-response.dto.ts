import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class SessionUserDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;
}

export class AuthSessionResponseDto {
  @ApiProperty({ type: () => SessionUserDto })
  @Type(() => SessionUserDto)
  @Expose()
  user: SessionUserDto;

  @ApiProperty()
  @Expose()
  csrfToken: string;

  @ApiProperty({
    description: 'Expiration timestamp for the access token',
  })
  @Expose()
  accessTokenExpiresAt: Date;

  @ApiProperty({
    description: 'Expiration timestamp for the refresh token',
  })
  @Expose()
  refreshTokenExpiresAt: Date;
}
