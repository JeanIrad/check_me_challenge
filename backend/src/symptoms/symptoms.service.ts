import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSymptomDto, FilterSymptomDto } from './dto/symptoms.dto';

@Injectable()
export class SymptomsService {
  constructor(private prisma: PrismaService) {}

  async create(patientId: string, dto: CreateSymptomDto) {
    // Verify patient exists first
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.symptom.create({
      data: {
        patientId,
        type: dto.type,
        severity: dto.severity,
        dateOfOccurrence: new Date(dto.dateOfOccurrence),
        notes: dto.notes,
      },
    });
  }

  async findAllForPatient(patientId: string, filters: FilterSymptomDto) {
    const whereClause: any = { patientId };

    // Dynamically build the where clause based on provided filters
    if (filters.type) {
      whereClause.type = filters.type;
    }
    if (filters.severity) {
      whereClause.severity = filters.severity;
    }
    if (filters.startDate || filters.endDate) {
      whereClause.dateOfOccurrence = {};
      if (filters.startDate)
        whereClause.dateOfOccurrence.gte = new Date(filters.startDate);
      if (filters.endDate)
        whereClause.dateOfOccurrence.lte = new Date(filters.endDate);
    }

    return this.prisma.symptom.findMany({
      where: whereClause,
      orderBy: { dateOfOccurrence: 'desc' }, // Newest first
    });
  }
}
