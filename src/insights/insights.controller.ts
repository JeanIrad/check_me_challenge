import { Controller, Get, Param } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Insights')
@Controller('patients/:patientId/insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get clinical insights for a patient based on recent symptoms',
  })
  @ApiParam({
    name: 'patientId',
    required: true,
    description: 'The UUID of the patient',
  })
  @ApiResponse({ status: 200, description: 'Insights successfully generated.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  getInsights(@Param('patientId') patientId: string) {
    return this.insightsService.getPatientInsights(patientId);
  }
}
