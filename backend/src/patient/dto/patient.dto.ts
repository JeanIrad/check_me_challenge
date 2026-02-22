import {
  IsString,
  IsInt,
  Min,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sex } from '@prisma/client';
import { Type } from 'class-transformer';
import { CreateSymptomDto } from './symptoms.dto';
export class CreatePatientDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 45 })
  @IsInt()
  @Min(0)
  age: number;

  @ApiProperty({ example: 'FEMALE' })
  @IsEnum(Sex)
  @IsNotEmpty()
  sex: Sex;

  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsString()
  @IsNotEmpty()
  contactInfo: string;

  // Optional symptoms can be included during patient creation
  @ApiPropertyOptional({
    type: () => [CreateSymptomDto],
    description:
      'Optional list of symptoms to log at the time of patient registration',
  })
  @IsOptional()
  symptoms?: CreateSymptomDto[];
}

export class GetPatientsFilterDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number) // Transforms the URL query string into a Number
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search by patient name or contact info',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
