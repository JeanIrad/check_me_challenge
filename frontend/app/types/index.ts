export type Sex = "MALE" | "FEMALE" | "OTHER";

export type SymptomType =
  | "BREAST_PAIN"
  | "LUMP_DETECTED"
  | "SKIN_CHANGES"
  | "NIPPLE_DISCHARGE"
  | "SWELLING"
  | "FATIGUE"
  | "OTHER";

export type SeverityTrend =
  | "worsening"
  | "improving"
  | "stable"
  | "insufficient_data";

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: Sex;
  contactInfo: string;
  createdAt: string;
  // enriched client-side
  _alert?: boolean;
  _topSymptom?: SymptomType | null;
  _trend?: SeverityTrend;
}

export interface Symptom {
  id: string;
  patientId: string;
  type: SymptomType;
  severity: number;
  dateOfOccurrence: string;
  notes?: string | null;
  createdAt: string;
}

export interface SeverityTrendData {
  trend: SeverityTrend;
  recentAvgSeverity: number | null;
  priorAvgSeverity: number | null;
}

export interface Insights {
  patientId: string;
  topSymptom: { type: SymptomType; count: number } | null;
  severityTrend: SeverityTrendData;
  alert: boolean;
}

export interface CreatePatientPayload {
  name: string;
  age: number;
  sex: Sex;
  contactInfo: string;
  symptoms?: CreateSymptomPayload[];
}

export interface CreateSymptomPayload {
  type: SymptomType;
  severity: number;
  dateOfOccurrence: string;
  notes?: string;
}

export interface SymptomFilters {
  from?: string;
  to?: string;
  type?: SymptomType | "";
  severity?: number | "";
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type Toast = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};
