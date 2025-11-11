import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetMovementsQueryDto {
  @ApiPropertyOptional({
    description: 'Comma separated list of tag names to filter movements',
    example: 'investimento,redutível',
  })
  @IsString()
  @IsOptional()
  tags?: string;
}
