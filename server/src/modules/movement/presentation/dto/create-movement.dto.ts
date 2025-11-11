import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsArray,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { MovementType } from '../../domain/value-objects/movement-type';

export class CreateMovementDto {
  @ApiProperty({
    description: 'Description of the movement',
    example: 'Spotify',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Type of movement',
    enum: MovementType,
    example: MovementType.EXPENSE,
  })
  @IsEnum(MovementType)
  @IsNotEmpty()
  type: MovementType;

  @ApiProperty({
    description: 'Amount (positive value)',
    example: 34.9,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Array of tag names',
    example: ['luxo', 'assinatura'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Date of the movement (ISO 8601 format)',
    example: '2025-10-26',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date?: string;
}
