import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    description: 'Tag name (lowercase, no accents/spaces)',
    example: 'assinatura',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+$/, {
    message:
      'Tag name must be lowercase letters and numbers only, no spaces or accents',
  })
  name: string;
}
