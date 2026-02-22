"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import { avatarColor, initials } from "../../lib/utils";
import { useToast } from "../../hooks";
import RegisterModal from "../modals/RegisterModal";
import PatientDetail from "./PatientDetial";
import OverviewPage from "./Overview";
import Toasts from "../ui/Toasts";
import type { Patient } from "../../types";

type Page = "overview" | "patient";

export default function Dashboard() {
  const [page, setPage] = useState<Page>("overview");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [navTab, setNavTab] = useState<"all" | "alerts">("all");
  const { toasts, push: toast } = useToast();

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await api.patients.list();
      const data: Patient[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as any)?.data)
          ? (raw as any).data
          : [];
      setPatients(data);
      // Enrich with insights in background
      enrichAll(data);
    } catch {
      // Silently fail if GET /patients not implemented — start empty
      setLoading(false);
    }
  }, []);

  async function enrichAll(pats: Patient[]) {
    setLoading(false);
    // Batch insights calls
    const enriched = await Promise.all(
      pats.map(async (p) => {
        try {
          const ins = await api.insights.get(p.id);
          return {
            ...p,
            _alert: ins.alert,
            _topSymptom: ins.topSymptom?.type ?? null,
            _trend: ins.severityTrend.trend,
          };
        } catch {
          return p;
        }
      }),
    );
    setPatients(enriched);
  }

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  function selectPatient(p: Patient) {
    setSelected(p);
    setPage("patient");
  }

  function onRegistered(p: Patient) {
    setPatients((prev) => [p, ...prev]);
    selectPatient(p);
  }
  console.log("PATIENTS===>", patients);
  const alertCount = patients?.filter((p) => p._alert).length ?? 0;

  const filtered = patients.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.contactInfo.toLowerCase().includes(search.toLowerCase());
    const matchTab = navTab === "all" || (navTab === "alerts" && p._alert);
    return matchSearch && matchTab;
  });

  const topbarTitle =
    page === "overview" ? "Dashboard" : (selected?.name ?? "Patient");

  const topbarSub =
    page === "overview"
      ? `${patients.length} patients · ${alertCount} alert${alertCount !== 1 ? "s" : ""}`
      : selected
        ? `Age ${selected.age} · ${selected.sex} · ${selected.contactInfo}`
        : "";

  return (
    <>
      <div className="app">
        {/* ── SIDEBAR ── */}
        <nav className="sidebar">
          <div className="sidebar-head">
            <div className="logo">
              <div className="logo-mark">✚</div>
              <div className="logo-name">
                Check<em>Me</em>
              </div>
            </div>

            <div className="nav-tabs">
              <button
                className={`nav-tab ${page === "overview" ? "active" : ""}`}
                onClick={() => {
                  setPage("overview");
                  setSelected(null);
                }}
              >
                ⊞ Overview
              </button>
              <button
                className={`nav-tab ${page === "patient" ? "active" : ""}`}
                onClick={() => {
                  if (!selected) setPage("patient");
                }}
                style={{ position: "relative" }}
              >
                ◎ Patients
                {alertCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 6,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--red)",
                      boxShadow: "0 0 6px var(--red)",
                    }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Patient list */}
          <div className="sidebar-body">
            {/* Filter tabs */}
            <div className="flex gap-6 mb-8">
              {(
                [
                  ["all", "All"],
                  ["alerts", `⚠ ${alertCount}`],
                ] as const
              ).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setNavTab(k)}
                  style={{
                    flex: 1,
                    padding: "5px 8px",
                    borderRadius: "var(--r)",
                    border: "1px solid",
                    borderColor:
                      navTab === k ? "rgba(20,184,166,0.3)" : "var(--border)",
                    background:
                      navTab === k ? "var(--teal-dim)" : "transparent",
                    color: navTab === k ? "var(--teal)" : "var(--text3)",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="search-box mb-8">
              <span className="search-icon">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patients..."
              />
            </div>

            <div className="sidebar-label">
              {filtered.length} Patient{filtered.length !== 1 ? "s" : ""}
            </div>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: "var(--text3)",
                }}
              >
                <span className="spin">⟳</span>
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  padding: "16px 8px",
                  color: "var(--text3)",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                {patients.length === 0 ? "No patients yet" : "No matches"}
              </div>
            ) : (
              filtered.map((p) => {
                const [bg, fg] = avatarColor(p.name);
                return (
                  <div
                    key={p.id}
                    className={`patient-item ${selected?.id === p.id ? "active" : ""}`}
                    onClick={() => selectPatient(p)}
                  >
                    <div
                      className="avatar"
                      style={{ background: bg, color: fg }}
                    >
                      {initials(p.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="p-name truncate">{p.name}</div>
                      <div className="p-meta">
                        Age {p.age} · {p.sex}
                      </div>
                    </div>
                    {p._alert && (
                      <span
                        style={{
                          color: "var(--red)",
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        ⚠
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="sidebar-foot">
            <button
              className="btn btn-primary btn-fw"
              onClick={() => setShowRegister(true)}
            >
              + Register Patient
            </button>
          </div>
        </nav>

        {/* ── MAIN ── */}
        <main className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <div className="topbar-title">{topbarTitle}</div>
              <div className="topbar-sub">{topbarSub}</div>
            </div>
            {page === "patient" && selected && (
              <div className="flex gap-8">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setPage("overview");
                    setSelected(null);
                  }}
                >
                  ← Back
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="content">
            {page === "overview" && (
              <OverviewPage
                patients={patients}
                onSelectPatient={selectPatient}
              />
            )}

            {page === "patient" && !selected && (
              <div className="empty" style={{ marginTop: 60 }}>
                <div className="empty-icon">◎</div>
                <div className="empty-text">
                  Select a patient from the sidebar
                </div>
                <div className="empty-sub">
                  or register a new patient to get started
                </div>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 20 }}
                  onClick={() => setShowRegister(true)}
                >
                  + Register First Patient
                </button>
              </div>
            )}

            {page === "patient" && selected && (
              <PatientDetail
                key={selected.id}
                patient={selected}
                toast={toast}
              />
            )}
          </div>
        </main>
      </div>

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSuccess={onRegistered}
          toast={toast}
        />
      )}

      <Toasts toasts={toasts} />
    </>
  );
}
