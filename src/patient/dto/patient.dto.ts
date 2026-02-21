import { IsString, IsInt, Min, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sex } from '@prisma/client';
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
}
