import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto, GetPatientsFilterDto } from './dto/patient.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateSymptomDto } from './dto/symptoms.dto';

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new patient' })
  @ApiResponse({ status: 201, description: 'Patient successfully registered.' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of all patients' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of patients.',
  })
  async findAll(@Query() filters: GetPatientsFilterDto) {
    return this.patientsService.findAll(filters);
  }
}
