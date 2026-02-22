// create-symptom.dto.ts
import {
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';
import { SymptomType } from '@prisma/client';

export class CreateSymptomDto {
  @IsEnum(SymptomType)
  type: SymptomType;

  @IsInt()
  @Min(1)
  @Max(5)
  severity: number; // Validates 1-5 scale [cite: 29]

  @IsDateString()
  dateOfOccurrence: string; // ISO 8601 date string

  @IsOptional()
  @IsString()
  notes?: string;
}
