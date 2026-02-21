import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientsController } from './patient.controller';
import { PrismaModule } from 'prisma/prisma.module';
// import { InsightsService } from './insights.service';

@Module({
  imports: [PrismaModule],
  controllers: [PatientsController],
  providers: [PatientService /* InsightsService */],
  exports: [PatientService /* InsightsService */],
})
export class PatientModule {}
