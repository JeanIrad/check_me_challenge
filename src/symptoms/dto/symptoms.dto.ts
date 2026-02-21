import {
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SymptomType } from '@prisma/client';

export class CreateSymptomDto {
  @ApiProperty({ enum: SymptomType, example: SymptomType.BREAST_PAIN })
  @IsEnum(SymptomType)
  type: SymptomType;

  @ApiProperty({ example: 3, description: 'Severity scale 1-5' })
  @IsInt()
  @Min(1)
  @Max(5)
  severity: number;

  @ApiProperty({ example: '2026-02-21T10:00:00Z' })
  @IsDateString()
  dateOfOccurrence: string;

  @ApiPropertyOptional({ example: 'Patient reported sharp pain.' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class FilterSymptomDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: SymptomType })
  @IsOptional()
  @IsEnum(SymptomType)
  type?: SymptomType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  severity?: number;
}
