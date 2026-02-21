import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { subDays } from 'date-fns';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async getPatientInsights(patientId: string) {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const sevenDaysAgo = subDays(today, 7);
    const fourteenDaysAgo = subDays(today, 14);

    // Fetch all relevant symptoms in one go to minimize DB calls
    const recentSymptoms = await this.prisma.symptom.findMany({
      where: { patientId, dateOfOccurrence: { gte: thirtyDaysAgo } },
      orderBy: { dateOfOccurrence: 'desc' },
    });

    // EDGE CASE: No data [cite: 39]
    if (recentSymptoms.length === 0) {
      return {
        topSymptom: null,
        severityTrend: 'stable', // Sensible default [cite: 40]
        alert: false,
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

  // 1. Top Symptom (Most frequent in last 30 days) [cite: 37]
  private calculateTopSymptom(symptoms: any[]) {
    const frequencies = {};
    let maxFreq = 0;
    let top = null;

    symptoms.forEach((s) => {
      frequencies[s.type] = (frequencies[s.type] || 0) + 1;
      if (frequencies[s.type] > maxFreq) {
        maxFreq = frequencies[s.type];
        top = s.type;
      }
    });
    return top;
  }

  // 2. Severity Trend (Last 7 days vs Prior 7 days) [cite: 37]
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

    // EDGE CASE: Not enough data for comparison
    if (last7Days.length === 0 || prior7Days.length === 0) return 'stable';

    const avgLast7 =
      last7Days.reduce((sum, s) => sum + s.severity, 0) / last7Days.length;
    const avgPrior7 =
      prior7Days.reduce((sum, s) => sum + s.severity, 0) / prior7Days.length;

    if (avgLast7 > avgPrior7) return 'worsening';
    if (avgLast7 < avgPrior7) return 'improving';
    return 'stable';
  }

  // 3. Alert Flag (Severity >= 4 logged 3+ times in past 7 days) [cite: 37]
  private calculateAlertFlag(symptoms: any[], sevenDaysAgo: Date) {
    const severeInLast7Days = symptoms.filter(
      (s) => s.dateOfOccurrence >= sevenDaysAgo && s.severity >= 4,
    );
    return severeInLast7Days.length >= 3;
  }
}
