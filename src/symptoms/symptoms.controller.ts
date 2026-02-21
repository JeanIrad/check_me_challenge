import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { SymptomsService } from './symptoms.service';
import { CreateSymptomDto, FilterSymptomDto } from './dto/symptoms.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Symptoms')
@Controller('patients/:patientId/symptoms')
export class SymptomsController {
  constructor(private readonly symptomsService: SymptomsService) {}

  @Post()
  @ApiOperation({ summary: 'Log a symptom entry for a specific patient' })
  @ApiParam({ name: 'patientId', required: true })
  @ApiResponse({ status: 201, description: 'Symptom successfully logged.' })
  create(
    @Param('patientId') patientId: string,
    @Body() createSymptomDto: CreateSymptomDto,
  ) {
    return this.symptomsService.create(patientId, createSymptomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve symptom history with optional filters' })
  @ApiParam({ name: 'patientId', required: true })
  findAll(
    @Param('patientId') patientId: string,
    @Query() filters: FilterSymptomDto,
  ) {
    return this.symptomsService.findAllForPatient(patientId, filters);
  }
}
