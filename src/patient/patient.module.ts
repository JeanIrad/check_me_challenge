import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientsController } from './patient.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PatientsController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
