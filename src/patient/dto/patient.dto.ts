import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 45 })
  @IsInt()
  @Min(0)
  age: number;

  @ApiProperty({ example: 'Female' })
  @IsString()
  @IsNotEmpty()
  sex: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsString()
  @IsNotEmpty()
  contactInfo: string;
}
