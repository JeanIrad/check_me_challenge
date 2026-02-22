"use client";
import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { api, SYMPTOM_LABELS, SYMPTOM_TYPES } from "../../lib/api";
import {
  formatDate,
  trendIcon,
  trendClass,
  paginate,
  severityColor,
} from "../../lib/utils";
import { usePagination } from "../../hooks";
import Pagination from "../ui/Pagination";
import SeverityBadge from "../ui/SeverityBadge";
import LogSymptomModal from "../modals/LogSymptomModal";
import type {
  Patient,
  Symptom,
  Insights,
  SymptomFilters,
  SymptomType,
} from "../../types";

const PAGE_SIZE = 8;

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--surface2)",
        border: "1px solid var(--border2)",
        borderRadius: "var(--r)",
        padding: "10px 14px",
        fontSize: 12,
      }}
    >
      <div
        style={{
          color: "var(--text3)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

type Tab = "overview" | "history" | "charts";

interface Props {
  patient: Patient;
  toast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function PatientDetail({ patient, toast }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loadingSym, setLoadingSym] = useState(true);
  const [loadingIns, setLoadingIns] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [filters, setFilters] = useState<SymptomFilters>({
    from: "",
    to: "",
    type: "",
    severity: "",
  });

  const loadSymptoms = useCallback(async () => {
    setLoadingSym(true);
    try {
      const data = await api.symptoms.list(patient.id, filters);
      setSymptoms(data);
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setLoadingSym(false);
    }
  }, [patient.id, filters]);

  const loadInsights = useCallback(async () => {
    setLoadingIns(true);
    try {
      const data = await api.insights.get(patient.id);
      setInsights(data);
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setLoadingIns(false);
    }
  }, [patient.id]);

  useEffect(() => {
    loadSymptoms();
  }, [loadSymptoms]);
  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Pagination for history tab
  const pag = usePagination(symptoms.length, PAGE_SIZE);
  const { data: pageSym } = paginate(symptoms, pag.page, PAGE_SIZE);

  // Reset page when filters/symptoms change
  useEffect(() => {
    pag.reset();
  }, [symptoms.length]);

  const setFilter =
    (k: keyof SymptomFilters) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFilters((f) => ({ ...f, [k]: e.target.value }));

  const clearFilters = () =>
    setFilters({ from: "", to: "", type: "", severity: "" });
  const hasFilters = Object.values(filters).some(Boolean);

  // Chart data
  const chartData = [...symptoms]
    .sort(
      (a, b) =>
        new Date(a.dateOfOccurrence).getTime() -
        new Date(b.dateOfOccurrence).getTime(),
    )
    .slice(-30)
    .map((s) => ({
      date: new Date(s.dateOfOccurrence).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
      severity: s.severity,
      type: SYMPTOM_LABELS[s.type],
    }));

  const typeCount = symptoms.reduce<Record<string, number>>((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(typeCount)
    .map(([type, count]) => ({ name: SYMPTOM_LABELS[type], count }))
    .sort((a, b) => b.count - a.count);

  const avgSev = symptoms.length
    ? (symptoms.reduce((s, x) => s + x.severity, 0) / symptoms.length).toFixed(
        1,
      )
    : "—";

  return (
    <>
      {/* Alert */}
      {insights?.alert && (
        <div className="alert-banner">
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <div
              style={{ fontWeight: 700, color: "var(--red)", fontSize: 13.5 }}
            >
              High Severity Alert
            </div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
              Severity ≥4 recorded 3+ times in the last 7 days. Immediate
              clinical review recommended.
            </div>
          </div>
          <span
            className="badge badge-alert"
            style={{ marginLeft: "auto", flexShrink: 0 }}
          >
            ACTIVE
          </span>
        </div>
      )}

      {/* Stat row */}
      <div className="stat-grid mb-20">
        {[
          {
            label: "Total Symptoms",
            value: symptoms.length,
            color: "var(--teal)",
            sub: "all time",
          },
          {
            label: "Avg Severity",
            value: avgSev,
            color: "var(--amber)",
            sub: "across all entries",
          },
          {
            label: "7-day Trend",
            sub: "recent vs prior week",
            custom:
              !loadingIns && insights ? (
                <div
                  className={`trend-row ${trendClass(insights.severityTrend.trend)}`}
                  style={{ marginTop: 4 }}
                >
                  <span className="trend-arrow">
                    {trendIcon(insights.severityTrend.trend)}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 20,
                      fontWeight: 700,
                      textTransform: "capitalize",
                    }}
                  >
                    {insights.severityTrend.trend?.replace("_", " ")}
                  </span>
                </div>
              ) : (
                <span className="spin muted">⟳</span>
              ),
          },
          {
            label: "Alert Status",
            sub: "sev ≥4 in 7 days",
            custom: !loadingIns ? (
              <span
                className={`badge ${insights?.alert ? "badge-alert" : "badge-ok"}`}
                style={{ fontSize: 13, padding: "6px 14px", marginTop: 6 }}
              >
                {insights?.alert ? "⚠ ALERT" : "✓ Normal"}
              </span>
            ) : (
              <span className="spin muted">⟳</span>
            ),
          },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div
              className="stat-card-accent"
              style={{
                background:
                  i === 0
                    ? "linear-gradient(90deg,var(--teal),transparent)"
                    : i === 1
                      ? "linear-gradient(90deg,var(--amber),transparent)"
                      : i === 3 && insights?.alert
                        ? "linear-gradient(90deg,var(--red),transparent)"
                        : "linear-gradient(90deg,var(--green),transparent)",
              }}
            />
            <div className="stat-label">{s.label}</div>
            {s.custom ? (
              s.custom
            ) : (
              <div className="stat-value" style={{ color: s.color }}>
                {s.value}
              </div>
            )}
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {(
          [
            ["overview", "Overview"],
            ["history", "Symptom History"],
            ["charts", "Charts"],
          ] as [Tab, string][]
        ).map(([k, l]) => (
          <button
            key={k}
            className={`tab ${tab === k ? "active" : ""}`}
            onClick={() => setTab(k)}
          >
            {l}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-primary btn-sm"
          style={{ marginBottom: 2 }}
          onClick={() => setShowLog(true)}
        >
          + Log Symptom
        </button>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <>
          {!loadingIns && insights && (
            <div className="card mb-16">
              <div className="card-title">✦ Clinical Insights</div>
              <div className="grid-3" style={{ gap: 12 }}>
                <div className="insight-card">
                  <div className="insight-key">Top Symptom (30d)</div>
                  {insights.topSymptom ? (
                    <>
                      <div className="insight-val">
                        {SYMPTOM_LABELS[insights.topSymptom.type]}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text3)",
                          marginTop: 6,
                        }}
                      >
                        Logged {insights.topSymptom.count}× in last 30 days
                      </div>
                    </>
                  ) : (
                    <div className="insight-val muted" style={{ fontSize: 16 }}>
                      No data
                    </div>
                  )}
                </div>

                <div className="insight-card">
                  <div className="insight-key">Severity Trend</div>
                  <div
                    className={`trend-row ${trendClass(insights.severityTrend.trend)}`}
                  >
                    <span className="trend-arrow" style={{ fontSize: 26 }}>
                      {trendIcon(insights.severityTrend.trend)}
                    </span>
                    <div>
                      <div
                        className="insight-val"
                        style={{ fontSize: 18, textTransform: "capitalize" }}
                      >
                        {insights.severityTrend.trend?.replace("_", " ")}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text3)",
                          marginTop: 2,
                        }}
                      >
                        {insights.severityTrend.recentAvgSeverity != null
                          ? `Recent: ${insights.severityTrend.recentAvgSeverity} vs Prior: ${insights.severityTrend.priorAvgSeverity ?? "—"}`
                          : "Insufficient data for comparison"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="insight-card">
                  <div className="insight-key">Alert Flag</div>
                  <div style={{ marginTop: 6 }}>
                    <span
                      className={`badge ${insights.alert ? "badge-alert" : "badge-ok"}`}
                      style={{ fontSize: 12, padding: "5px 14px" }}
                    >
                      {insights.alert ? "⚠ ALERT ACTIVE" : "✓ All Clear"}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text3)",
                      marginTop: 10,
                    }}
                  >
                    Severity ≥4 logged{" "}
                    {insights.alert ? "3 or more" : "fewer than 3"} times in the
                    past 7 days
                  </div>
                </div>
              </div>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="card">
              <div className="card-title">Severity Over Time</div>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,196,242,0.06)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "var(--text3)",
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fill: "var(--text3)", fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="severity"
                    name="Severity"
                    stroke="var(--teal)"
                    strokeWidth={2.5}
                    dot={({ cx, cy, payload }: any) => (
                      <circle
                        key={cx}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={severityColor(payload.severity)}
                        stroke="var(--bg)"
                        strokeWidth={1.5}
                      />
                    )}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.length === 0 && !loadingSym && (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">No symptom history yet</div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => setShowLog(true)}
              >
                + Log First Symptom
              </button>
            </div>
          )}
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <>
          <div className="filter-bar">
            <input
              type="date"
              value={filters.from as string}
              onChange={setFilter("from")}
              style={{ maxWidth: 150 }}
            />
            <input
              type="date"
              value={filters.to as string}
              onChange={setFilter("to")}
              style={{ maxWidth: 150 }}
            />
            <select
              value={filters.type as string}
              onChange={setFilter("type")}
              style={{ maxWidth: 180 }}
            >
              <option value="">All Types</option>
              {SYMPTOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SYMPTOM_LABELS[t]}
                </option>
              ))}
            </select>
            <select
              value={filters.severity as string}
              onChange={setFilter("severity")}
              style={{ maxWidth: 150 }}
            >
              <option value="">All Severity</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}/5
                </option>
              ))}
            </select>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                ✕ Clear
              </button>
            )}
            <span
              style={{
                marginLeft: "auto",
                color: "var(--text3)",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
            >
              {symptoms.length} results
            </span>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {loadingSym ? (
              <div className="empty">
                <span className="spin" style={{ fontSize: 24 }}>
                  ⟳
                </span>
              </div>
            ) : symptoms.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🔍</div>
                <div className="empty-text">
                  {hasFilters
                    ? "No results for these filters"
                    : "No symptoms logged"}
                </div>
              </div>
            ) : (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Severity</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageSym.map((s) => (
                        <tr key={s.id}>
                          <td className="mono" style={{ fontSize: 12 }}>
                            {formatDate(s.dateOfOccurrence)}
                          </td>
                          <td>
                            <span className="badge badge-info">
                              {SYMPTOM_LABELS[s.type]}
                            </span>
                          </td>
                          <td>
                            <SeverityBadge value={s.severity} />
                          </td>
                          <td
                            style={{
                              color: "var(--text3)",
                              maxWidth: 220,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {s.notes || <span style={{ opacity: 0.4 }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={pag.page}
                  totalPages={pag.totalPages}
                  total={symptoms.length}
                  pageSize={PAGE_SIZE}
                  onPage={pag.goTo}
                />
              </>
            )}
          </div>
        </>
      )}

      {/* ── CHARTS TAB ── */}
      {tab === "charts" && (
        <div className="grid-2">
          <div className="card">
            <div className="card-title">Severity Over Time (last 30)</div>
            {chartData.length === 0 ? (
              <div className="empty" style={{ padding: 32 }}>
                <div className="empty-text">No data yet</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,196,242,0.06)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "var(--text3)", fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fill: "var(--text3)", fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="severity"
                    name="Severity"
                    stroke="var(--teal)"
                    strokeWidth={2.5}
                    dot={({ cx, cy, payload }: any) => (
                      <circle
                        key={cx}
                        cx={cx}
                        cy={cy}
                        r={4.5}
                        fill={severityColor(payload.severity)}
                        stroke="var(--bg)"
                        strokeWidth={1.5}
                      />
                    )}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <div className="card-title">Symptom Frequency</div>
            {barData.length === 0 ? (
              <div className="empty" style={{ padding: 32 }}>
                <div className="empty-text">No data yet</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,196,242,0.06)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "var(--text3)", fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "var(--text2)", fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Count"
                    fill="var(--teal)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {showLog && (
        <LogSymptomModal
          patient={patient}
          onClose={() => setShowLog(false)}
          onSuccess={() => {
            loadSymptoms();
            loadInsights();
          }}
          toast={toast}
        />
      )}
    </>
  );
}
