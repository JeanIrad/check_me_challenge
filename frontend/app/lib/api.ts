import type {
  Patient,
  Symptom,
  Insights,
  CreatePatientPayload,
  CreateSymptomPayload,
  SymptomFilters,
} from "../types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const SYMPTOM_LABELS: Record<string, string> = {
  BREAST_PAIN: "Breast Pain",
  LUMP_DETECTED: "Lump Detected",
  SKIN_CHANGES: "Skin Changes",
  NIPPLE_DISCHARGE: "Nipple Discharge",
  SWELLING: "Swelling",
  FATIGUE: "Fatigue",
  OTHER: "Other",
};

export const SYMPTOM_TYPES = Object.keys(SYMPTOM_LABELS);

export const SEV_LABELS = [
  "",
  "Minimal",
  "Mild",
  "Moderate",
  "Severe",
  "Critical",
];

export const SEV_COLORS = [
  "",
  "#34d399",
  "#a3e635",
  "#fbbf24",
  "#f97316",
  "#f87171",
];

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  patients: {
    list: () => req<Patient[]>("/patients"),
    create: (data: CreatePatientPayload) =>
      req<Patient>("/patients", { method: "POST", body: JSON.stringify(data) }),
    get: (id: string) => req<Patient>(`/patients/${id}`),
  },

  symptoms: {
    list: (patientId: string, filters?: SymptomFilters) => {
      const params = new URLSearchParams();
      if (filters?.from) params.set("from", filters.from);
      if (filters?.to) params.set("to", filters.to);
      if (filters?.type) params.set("type", filters.type);
      if (filters?.severity) params.set("severity", String(filters.severity));
      return req<Symptom[]>(`/patients/${patientId}/symptoms?${params}`);
    },
    create: (patientId: string, data: CreateSymptomPayload) =>
      req<Symptom>(`/patients/${patientId}/symptoms`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  insights: {
    get: (patientId: string) =>
      req<Insights>(`/patients/${patientId}/insights`),
  },
};
