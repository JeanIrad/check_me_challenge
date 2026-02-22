"use client";
import { useState } from "react";
import { api, SYMPTOM_LABELS, SYMPTOM_TYPES, SEV_LABELS } from "../../lib/api";
import { severityColor } from "../../lib/utils";
import type { Patient, SymptomType } from "../../types";

interface Props {
  patient: Patient;
  onClose: () => void;
  onSuccess: () => void;
  toast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function LogSymptomModal({
  patient,
  onClose,
  onSuccess,
  toast,
}: Props) {
  const [form, setForm] = useState({
    type: "BREAST_PAIN" as SymptomType,
    severity: 3,
    dateOfOccurrence: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const set =
    (k: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((f) => ({
        ...f,
        [k]:
          k === "severity"
            ? parseInt((e.target as HTMLInputElement).value)
            : e.target.value,
      }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.symptoms.create(patient.id, {
        type: form.type,
        severity: form.severity,
        dateOfOccurrence: form.dateOfOccurrence,
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      });
      toast("Symptom logged successfully", "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast(err.message || "Failed to log symptom", "error");
    } finally {
      setLoading(false);
    }
  }

  const color = severityColor(form.severity);

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Log Symptom</div>
            <div className="modal-sub">for {patient.name}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-row cols-2 mb-16">
              <div className="field">
                <label className="label">Symptom Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as SymptomType,
                    }))
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
                  value={form.dateOfOccurrence}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={set("dateOfOccurrence")}
                  required
                />
              </div>
            </div>

            <div className="field mb-16">
              <label className="label">
                <span>Severity</span>
                <span
                  style={{
                    color,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                  }}
                >
                  {form.severity} — {SEV_LABELS[form.severity]}
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={form.severity}
                onChange={set("severity")}
                className="range-input"
                style={{
                  background: `linear-gradient(to right, ${color} ${(form.severity - 1) * 25}%, var(--surface3) ${(form.severity - 1) * 25}%)`,
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
                <span style={{ color: "var(--text3)", fontWeight: 400 }}>
                  (optional)
                </span>
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={set("notes")}
                placeholder="Any relevant observations..."
              />
            </div>
          </div>

          <div className="modal-foot">
            <div />
            <div className="flex gap-8">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spin">⟳</span> Saving...
                  </>
                ) : (
                  "+ Log Symptom"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
