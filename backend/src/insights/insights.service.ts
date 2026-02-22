import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { subDays } from 'date-fns';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async getPatientInsights(patientId: string) {
    // 1. Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const sevenDaysAgo = subDays(today, 7);
    const fourteenDaysAgo = subDays(today, 14);

    // Fetch all symptoms from the last 30 days in one efficient query
    const recentSymptoms = await this.prisma.symptom.findMany({
      where: {
        patientId,
        dateOfOccurrence: { gte: thirtyDaysAgo },
      },
      orderBy: { dateOfOccurrence: 'desc' },
    });

    // EDGE CASE: Brand new patient with zero entries
    if (recentSymptoms.length === 0) {
      return {
        topSymptom: null,
        severityTrend: 'stable',
        alert: false,
        message: 'Not enough data to generate insights yet.',
      };
    }

    return {
      topSymptom: this.calculateTopSymptom(recentSymptoms),
      severityTrend: this.calculateSeverityTrend(
        recentSymptoms,
        sevenDaysAgo,
        fourteenDaysAgo,
      ),
      alert: this.calculateAlertFlag(recentSymptoms, sevenDaysAgo),
    };
  }

  // Helper 1: Most frequent symptom in the last 30 days
  private calculateTopSymptom(symptoms: any[]) {
    const frequencies: Record<string, number> = {};
    let maxFreq = 0;
    let top = null;

    for (const s of symptoms) {
      frequencies[s.type] = (frequencies[s.type] || 0) + 1;
      if (frequencies[s.type] > maxFreq) {
        maxFreq = frequencies[s.type];
        top = s.type;
      }
    }
    return top;
  }

  // Helper 2: Average severity last 7 days vs prior 7 days
  private calculateSeverityTrend(
    symptoms: any[],
    sevenDaysAgo: Date,
    fourteenDaysAgo: Date,
  ) {
    const last7Days = symptoms.filter(
      (s) => s.dateOfOccurrence >= sevenDaysAgo,
    );
    const prior7Days = symptoms.filter(
      (s) =>
        s.dateOfOccurrence >= fourteenDaysAgo &&
        s.dateOfOccurrence < sevenDaysAgo,
    );

    // EDGE CASE: If we lack data in either period, default to stable
    if (last7Days.length === 0 || prior7Days.length === 0) return 'stable';

    const avgLast7 =
      last7Days.reduce((sum, s) => sum + s.severity, 0) / last7Days.length;
    const avgPrior7 =
      prior7Days.reduce((sum, s) => sum + s.severity, 0) / prior7Days.length;

    if (avgLast7 > avgPrior7) return 'worsening';
    if (avgLast7 < avgPrior7) return 'improving';
    return 'stable';
  }

  // Helper 3: Alert if severity >= 4 logged 3+ times in the past 7 days
  private calculateAlertFlag(symptoms: any[], sevenDaysAgo: Date) {
    const severeInLast7Days = symptoms.filter(
      (s) => s.dateOfOccurrence >= sevenDaysAgo && s.severity >= 4,
    );
    return severeInLast7Days.length >= 3;
  }
}
