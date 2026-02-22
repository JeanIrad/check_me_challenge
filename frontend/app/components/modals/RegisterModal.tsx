"use client";
import { useState } from "react";
import { api, SYMPTOM_LABELS, SYMPTOM_TYPES, SEV_LABELS } from "../../lib/api";
import { severityColor } from "../../lib/utils";
import type {
  Patient,
  Sex,
  SymptomType,
  CreatePatientPayload,
  CreateSymptomPayload,
} from "../../types";

type Step = 1 | 2 | 3;

interface SymptomDraft {
  id: string;
  type: SymptomType;
  severity: number;
  dateOfOccurrence: string;
  notes: string;
}

function newSymptom(): SymptomDraft {
  return {
    id: Math.random().toString(36).slice(2),
    type: "BREAST_PAIN",
    severity: 3,
    dateOfOccurrence: new Date().toISOString().split("T")[0],
    notes: "",
  };
}

interface Props {
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
  toast: (msg: string, type?: "success" | "error" | "info") => void;
}

const STEPS = [
  { n: 1, label: "Patient Info" },
  { n: 2, label: "Symptoms" },
  { n: 3, label: "Review" },
];

export default function RegisterModal({ onClose, onSuccess, toast }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Step 1 state
  const [patient, setPatient] = useState<CreatePatientPayload>({
    name: "",
    age: 0,
    sex: "FEMALE",
    contactInfo: "",
  });

  // Step 2 state
  const [symptoms, setSymptoms] = useState<SymptomDraft[]>([newSymptom()]);

  // Helpers
  const setP =
    (k: keyof CreatePatientPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setPatient((p) => ({
        ...p,
        [k]: k === "age" ? parseInt(e.target.value) || 0 : e.target.value,
      }));

  const updateSymptom = (
    id: string,
    k: keyof SymptomDraft,
    v: string | number,
  ) => setSymptoms((s) => s.map((x) => (x.id === id ? { ...x, [k]: v } : x)));

  const addSymptom = () => {
    if (symptoms.length >= 5) return;
    setSymptoms((s) => [...s, newSymptom()]);
  };

  const removeSymptom = (id: string) => {
    if (symptoms.length <= 1) return;
    setSymptoms((s) => s.filter((x) => x.id !== id));
  };

  // Validation
  const step1Valid =
    patient.name.trim().length >= 2 &&
    patient.age > 0 &&
    patient.contactInfo.trim().length > 0;
  const step2Valid = symptoms.every(
    (s) => s.dateOfOccurrence && s.severity >= 1 && s.severity <= 5,
  );

  async function submit() {
    setLoading(true);
    try {
      const new_patient = {
        ...patient,
        symptoms: symptoms.map((s) => ({
          type: s.type,
          severity: s.severity,
          dateOfOccurrence: s.dateOfOccurrence,
          notes: s.notes.trim() ? s.notes.trim() : undefined,
        })),
      };
      const created = await api.patients.create(new_patient);
      // Log all symptoms sequentially
      //   for (const s of symptoms) {
      //     const payload: CreateSymptomPayload = {
      //       type: s.type,
      //       severity: s.severity,
      //       dateOfOccurrence: s.dateOfOccurrence,
      //       ...(s.notes.trim() ? { notes: s.notes.trim() } : {}),
      //     };
      //     await api.symptoms.create(created.id, payload);
      //   }
      toast(
        `${created.name} registered with ${symptoms.length} symptom${symptoms.length > 1 ? "s" : ""}`,
        "success",
      );
      onSuccess(created);
      onClose();
    } catch (err: any) {
      toast(err.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        {/* Header */}
        <div className="modal-head">
          <div>
            <div className="modal-title">Register Patient</div>
            <div className="modal-sub">
              Step {step} of 3 — {STEPS[step - 1].label}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Step indicator */}
          <div className="step-bar mb-24">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className={`step-item ${step > s.n ? "done" : ""}`}
              >
                <div
                  className={`step-circle ${step === s.n ? "active" : step > s.n ? "done" : ""}`}
                >
                  {step > s.n ? "✓" : s.n}
                </div>
                <span
                  className={`step-label ${step === s.n ? "active" : step > s.n ? "done" : ""}`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── STEP 1: Patient Info ── */}
          {step === 1 && (
            <div>
              <div className="form-row cols-2 mb-16">
                <div className="field">
                  <label className="label">Full Name</label>
                  <input
                    value={patient.name}
                    onChange={setP("name")}
                    placeholder="Jane Doe"
                    autoFocus
                  />
                </div>
                <div className="field">
                  <label className="label">Age</label>
                  <input
                    type="number"
                    min={0}
                    max={150}
                    value={patient.age || ""}
                    onChange={setP("age")}
                    placeholder="34"
                  />
                </div>
              </div>
              <div className="form-row cols-2 mb-16">
                <div className="field">
                  <label className="label">Sex</label>
                  <select value={patient.sex} onChange={setP("sex")}>
                    {(["FEMALE", "MALE", "OTHER"] as Sex[]).map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Contact Info</label>
                  <input
                    value={patient.contactInfo}
                    onChange={setP("contactInfo")}
                    placeholder="email or phone"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Symptoms ── */}
          {step === 2 && (
            <div>
              <div
                className="flex items-center justify-between mb-16"
                style={{
                  padding: "10px 14px",
                  background: "var(--teal-dim)",
                  borderRadius: "var(--r)",
                  border: "1px solid rgba(20,184,166,0.2)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--teal)",
                      fontSize: 13,
                    }}
                  >
                    Initial Symptoms Required
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text2)",
                      marginTop: 2,
                    }}
                  >
                    Log at least 1 symptom. You can add more later.
                  </div>
                </div>
                {symptoms.length < 5 && (
                  <button className="btn btn-ghost btn-sm" onClick={addSymptom}>
                    + Add
                  </button>
                )}
              </div>

              <div className="flex-col gap-12">
                {symptoms.map((sym, idx) => {
                  const sev = sym.severity;
                  const color = severityColor(sev);
                  return (
                    <div
                      key={sym.id}
                      style={{
                        background: "var(--bg3)",
                        border: "1px solid var(--border2)",
                        borderRadius: "var(--r-lg)",
                        padding: "16px 18px",
                      }}
                    >
                      <div className="flex items-center justify-between mb-12">
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color: "var(--text3)",
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                          }}
                        >
                          Symptom #{idx + 1}
                        </div>
                        {symptoms.length > 1 && (
                          <button
                            onClick={() => removeSymptom(sym.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text3)",
                              cursor: "pointer",
                              fontSize: 16,
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div className="form-row cols-2 mb-12">
                        <div className="field">
                          <label className="label">Type</label>
                          <select
                            value={sym.type}
                            onChange={(e) =>
                              updateSymptom(
                                sym.id,
                                "type",
                                e.target.value as SymptomType,
                              )
                            }
                          >
                            {SYMPTOM_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {SYMPTOM_LABELS[t]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label className="label">Date</label>
                          <input
                            type="date"
                            value={sym.dateOfOccurrence}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) =>
                              updateSymptom(
                                sym.id,
                                "dateOfOccurrence",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="field mb-12">
                        <label className="label">
                          <span>Severity</span>
                          <span
                            style={{
                              color,
                              fontFamily: "var(--font-mono)",
                              textTransform: "none",
                              letterSpacing: 0,
                            }}
                          >
                            {sev} — {SEV_LABELS[sev]}
                          </span>
                        </label>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          value={sev}
                          onChange={(e) =>
                            updateSymptom(
                              sym.id,
                              "severity",
                              parseInt(e.target.value),
                            )
                          }
                          className="range-input"
                          style={{
                            background: `linear-gradient(to right, ${color} ${(sev - 1) * 25}%, var(--surface3) ${(sev - 1) * 25}%)`,
                            accentColor: color,
                          }}
                        />
                        <div
                          className="flex justify-between mt-4"
                          style={{ fontSize: 10, color: "var(--text3)" }}
                        >
                          <span>1 Minimal</span>
                          <span>5 Critical</span>
                        </div>
                      </div>

                      <div className="field">
                        <label className="label">
                          Notes{" "}
                          <span
                            style={{ color: "var(--text3)", fontWeight: 400 }}
                          >
                            (optional)
                          </span>
                        </label>
                        <textarea
                          rows={2}
                          value={sym.notes}
                          onChange={(e) =>
                            updateSymptom(sym.id, "notes", e.target.value)
                          }
                          placeholder="Additional observations..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ── */}
          {step === 3 && (
            <div>
              {/* Patient summary */}
              <div
                className="mb-16"
                style={{
                  background: "var(--bg3)",
                  border: "1px solid var(--border2)",
                  borderRadius: "var(--r-lg)",
                  padding: "18px 20px",
                }}
              >
                <div className="card-title" style={{ marginBottom: 12 }}>
                  Patient Details
                </div>
                <div className="grid-2" style={{ gap: 10 }}>
                  {[
                    ["Name", patient.name],
                    ["Age", String(patient.age)],
                    ["Sex", patient.sex],
                    ["Contact", patient.contactInfo],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text3)",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          marginBottom: 3,
                        }}
                      >
                        {k}
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--text)",
                          fontSize: 13.5,
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Symptoms summary */}
              <div
                style={{
                  background: "var(--bg3)",
                  border: "1px solid var(--border2)",
                  borderRadius: "var(--r-lg)",
                  padding: "18px 20px",
                }}
              >
                <div className="card-title" style={{ marginBottom: 12 }}>
                  Symptoms
                  <span className="badge badge-info">{symptoms.length}</span>
                </div>
                <div className="flex-col gap-8">
                  {symptoms.map((s, i) => {
                    const color = severityColor(s.severity);
                    return (
                      <div
                        key={s.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          background: "var(--surface)",
                          borderRadius: "var(--r)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: `${color}22`,
                            color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "var(--font-mono)",
                            flexShrink: 0,
                          }}
                        >
                          {s.severity}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              color: "var(--text)",
                            }}
                          >
                            {SYMPTOM_LABELS[s.type]}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>
                            {s.dateOfOccurrence}
                            {s.notes ? ` · ${s.notes}` : ""}
                          </div>
                        </div>
                        <span
                          className="badge badge-dim"
                          style={{ fontSize: 10 }}
                        >
                          {SEV_LABELS[s.severity]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-foot">
          <div>
            {step > 1 && (
              <button
                className="btn btn-ghost"
                onClick={() => setStep((s) => (s - 1) as Step)}
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex gap-8">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            {step < 3 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={step === 1 ? !step1Valid : !step2Valid}
              >
                Continue →
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                onClick={submit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spin">⟳</span> Registering...
                  </>
                ) : (
                  `✦ Register & Log ${symptoms.length} Symptom${symptoms.length > 1 ? "s" : ""}`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
