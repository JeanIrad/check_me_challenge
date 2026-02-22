"use client";
import { useState } from "react";
import { SYMPTOM_LABELS } from "../../lib/api";
import { avatarColor, initials, formatDate, paginate } from "../../lib/utils";
import Pagination from "../ui/Pagination";
import { usePagination } from "../../hooks";
import type { Patient } from "../../types";

const PAGE_SIZE = 10;

interface Props {
  patients: Patient[];
  onSelectPatient: (p: Patient) => void;
}

export default function OverviewPage({ patients, onSelectPatient }: Props) {
  const alertPatients = patients.filter((p) => p._alert);
  const pag = usePagination(alertPatients.length, PAGE_SIZE);
  const { data: pageAlert } = paginate(alertPatients, pag.page, PAGE_SIZE);

  const alertRate = patients.length
    ? Math.round((alertPatients.length / patients.length) * 100)
    : 0;

  const stats = [
    {
      label: "Total Patients",
      value: patients.length,
      color: "var(--teal)",
      accent: "linear-gradient(90deg,var(--teal),transparent)",
      sub: "registered",
    },
    {
      label: "Active Alerts",
      value: alertPatients.length,
      color: "var(--red)",
      accent: "linear-gradient(90deg,var(--red),transparent)",
      sub: "need attention",
    },
    {
      label: "Alert Rate",
      value: `${alertRate}%`,
      color: "var(--amber)",
      accent: "linear-gradient(90deg,var(--amber),transparent)",
      sub: "of all patients",
    },
    {
      label: "System Status",
      value: "Online",
      color: "var(--green)",
      accent: "linear-gradient(90deg,var(--green),transparent)",
      sub: "API connected",
    },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="stat-grid mb-20">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div
              className="stat-card-accent"
              style={{ background: s.accent }}
            />
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Alerts table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 14px" }}>
          <div className="card-title" style={{ marginBottom: 0 }}>
            ⚠ Patients Requiring Attention
            {alertPatients.length > 0 && (
              <span className="badge badge-alert">{alertPatients.length}</span>
            )}
          </div>
        </div>

        {alertPatients.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">✅</div>
            <div className="empty-text">No active alerts</div>
            <div className="empty-sub">
              All patients are within normal severity ranges
            </div>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Sex</th>
                    <th>Top Symptom</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pageAlert.map((p) => {
                    const [bg, fg] = avatarColor(p.name);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="flex items-center gap-8">
                            <div
                              className="avatar"
                              style={{
                                width: 30,
                                height: 30,
                                background: bg,
                                color: fg,
                                fontSize: 11,
                              }}
                            >
                              {initials(p.name)}
                            </div>
                            <span className="td-name">{p.name}</span>
                          </div>
                        </td>
                        <td>{p.age}</td>
                        <td>{p.sex}</td>
                        <td>
                          {p._topSymptom ? (
                            <span className="badge badge-info">
                              {SYMPTOM_LABELS[p._topSymptom]}
                            </span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-alert">⚠ ALERT</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => onSelectPatient(p)}
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pag.page}
              totalPages={pag.totalPages}
              total={alertPatients.length}
              pageSize={PAGE_SIZE}
              onPage={pag.goTo}
            />
          </>
        )}
      </div>
    </div>
  );
}
