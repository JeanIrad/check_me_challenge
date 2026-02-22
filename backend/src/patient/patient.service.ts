import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientDto, GetPatientsFilterDto } from './dto/patient.dto';
import { CreateSymptomDto } from './dto/symptoms.dto';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    const { symptoms, ...patientData } = createPatientDto;
    console.log('Creating patient with data:', patientData);
    console.log('Symptoms to log:', symptoms);
    return this.prisma.$transaction(async (tx) => {
      const patient = await tx.patient.create({
        data: {
          name: patientData.name,
          age: patientData.age,
          sex: patientData.sex,
          contactInfo: patientData.contactInfo,
          symptoms: {
            createMany: {
              data:
                symptoms?.map((s) => ({
                  type: s.type,
                  severity: s.severity,
                  dateOfOccurrence: new Date(s.dateOfOccurrence),
                  notes: s.notes ?? null,
                })) ?? [],
            },
          },
        },
      });

      return tx.patient.findUnique({
        where: { id: patient.id },
        include: { symptoms: { orderBy: { dateOfOccurrence: 'desc' } } },
      });
    });
  }
  async findOne(id: string) {
    return this.prisma.patient.findUnique({
      where: { id },
      include: { symptoms: { orderBy: { dateOfOccurrence: 'desc' } } },
    });
  }

  async findAll(filters: GetPatientsFilterDto) {
    const { page = 1, limit = 10, search } = filters;

    // Calculate how many records to skip
    const skip = (page - 1) * limit;

    // Build the search condition dynamically
    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { contactInfo: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    try {
      // Run both queries concurrently for better performance
      const [data, total] = await Promise.all([
        this.prisma.patient.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }, // Newest patients first
        }),
        this.prisma.patient.count({ where: whereClause }), // Get total count for metadata
      ]);

      // Return standardized paginated response
      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve patients');
    }
  }
}
