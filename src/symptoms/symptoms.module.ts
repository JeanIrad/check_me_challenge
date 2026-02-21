import { Module } from '@nestjs/common';
import { SymptomsService } from './symptoms.service';
import { SymptomsController } from './symptoms.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SymptomsService],
  controllers: [SymptomsController],
  exports: [SymptomsService],
})
export class SymptomsModule {}
