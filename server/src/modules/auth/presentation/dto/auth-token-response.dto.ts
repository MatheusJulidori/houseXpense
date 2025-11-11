import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthTokenResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose({ name: 'access_token' })
  access_token: string;
}
