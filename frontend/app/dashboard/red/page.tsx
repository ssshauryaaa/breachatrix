"use client";

import "@/styles/redteam.css";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type AttackLog = {
  id: string;
  attackerId: string;
  targetTeamId: string;
  type: string;
  success: boolean;
  createdAt: string;
};

type Target = {
  id: string;
  name: string;
  score: number;
};

type MyTeam = {
  id: string;
  name: string;
  role: string;
  score: number;
};

const ATTACK_TYPES = [
  {
    value: "SQL_INJECTION",
    label: "SQL Injection",
    icon: "💉",
    severity: "CRITICAL",
  },
  { value: "XSS", label: "Cross-Site Scripting", icon: "🪝", severity: "HIGH" },
  {
    value: "AUTH_BYPASS",
    label: "Auth Bypass",
    icon: "🔓",
    severity: "CRITICAL",
  },
  {
    value: "MISCONFIG",
    label: "Misconfiguration Exploit",
    icon: "⚙️",
    severity: "MEDIUM",
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#ff2244",
  HIGH: "#ff8800",
  MEDIUM: "#ffcc00",
};

function getSeverity(type: string) {
  const found = ATTACK_TYPES.find((a) => a.value === type);
  return found?.severity ?? "MEDIUM";
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { hour12: false });
}

function GlitchText({ text }: { text: string }) {
  return (
    <span className="glitch" data-text={text}>
      {text}
    </span>
  );
}

export default function RedTeamDashboard() {
  const [logs, setLogs] = useState<AttackLog[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [myTeam, setMyTeam] = useState<MyTeam | null>(null);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [attackType, setAttackType] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [scanning, setScanning] = useState(false);

  async function fetchAll() {
    try {
      const [lRes, tRes, mRes] = await Promise.all([
        fetch("http://localhost:5000/attack/history", {
          credentials: "include",
        }),
        fetch("http://localhost:5000/attack/targets", {
          credentials: "include",
        }),
        fetch("http://localhost:5000/team/me", {
          credentials: "include",
        }),
      ]);
      const [lData, tData, mData] = await Promise.all([
        lRes.json(),
        tRes.json(),
        mRes.json(),
      ]);
      setLogs(Array.isArray(lData) ? lData : []);
      setTargets(Array.isArray(tData) ? tData : []);
      if (mData && mData.id) setMyTeam(mData);
    } catch {
      setLogs([]);
    }
  }

  async function fetchLogs() {
    try {
      const [lRes, mRes] = await Promise.all([
        fetch("http://localhost:5000/attack/history", {
          credentials: "include",
        }),
        fetch("http://localhost:5000/team/me", {
          credentials: "include",
        }),
      ]);
      const [lData, mData] = await Promise.all([lRes.json(), mRes.json()]);
      setLogs(Array.isArray(lData) ? lData : []);
      if (mData && mData.id) setMyTeam(mData);
    } catch {
      setLogs([]);
    }
  }

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    if (!selectedTarget || !attackType) {
      setSubmitMsg({ ok: false, text: "Select a target and attack vector." });
      return;
    }
    setLoading(true);
    setScanning(true);
    setSubmitMsg(null);

    // Fake scanning delay for drama
    await new Promise((r) => setTimeout(r, 1400));
    setScanning(false);

    try {
      const res = await fetch("http://localhost:5000/attack/submit", {
        method: "POST",
        credentials: "include", // 🔥 REQUIRED
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetTeamId: selectedTarget,
          type: attackType,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMsg({
          ok: true,
          text: `✔ BREACH LOGGED — ${data.attack?.type}`,
        });
        fetchLogs();
      } else {
        setSubmitMsg({ ok: false, text: data.error ?? "Attack failed." });
      }
    } catch {
      setSubmitMsg({ ok: false, text: "Network error." });
    } finally {
      setLoading(false);
    }
  }

  const successCount = logs.filter((l) => l.success).length;
  const criticalCount = logs.filter(
    (l) => getSeverity(l.type) === "CRITICAL",
  ).length;

  return (
    <>
      <AnnouncementBanner />
      {/* @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap'); */}

      <div className="rtd">
        {/* ——— TOP BAR ——— */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="badge-red">🔴 RED TEAM</span>
            <h1 className="topbar-title">
              BREACH<span>@</span>TRIX
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {myTeam && (
              <div className="team-score-badge">
                <span className="score-label">TEAM SCORE</span>
                <span className="score-value">{myTeam.score}</span>
                <span className="score-name">{myTeam.name}</span>
              </div>
            )}
            <span className="live-dot" />
            <span className="topbar-mono">LIVE SESSION</span>
          </div>
        </header>

        <div className="main-grid">
          {/* ——— STATS ROW ——— */}
          <div className="stats-row">
            <div className="stat-cell">
              <div className="stat-label">Total Attacks</div>
              <div className="stat-value red">{logs.length}</div>
              <div className="stat-sub">logged breaches</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Successful</div>
              <div className="stat-value">{successCount}</div>
              <div className="stat-sub">confirmed exploits</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Critical Hits</div>
              <div className="stat-value amber">{criticalCount}</div>
              <div className="stat-sub">high-severity</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Targets Online</div>
              <div className="stat-value">{targets.length}</div>
              <div className="stat-sub">available teams</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Team Score</div>
              <div className="stat-value red">{myTeam?.score ?? 0}</div>
              <div className="stat-sub">total points earned</div>
            </div>
          </div>

          {/* ——— ATTACK LOG ——— */}
          <section className="log-panel">
            <div className="panel-heading">
              <h2>Attack Log</h2>
              <div className="panel-heading-line" />
            </div>

            {logs.length === 0 ? (
              <div className="empty-log">
                &gt; NO ATTACK RECORDS FOUND
                <br />
                &gt; LAUNCH YOUR FIRST EXPLOIT
                <br />
                &gt; _
              </div>
            ) : (
              logs.map((log) => {
                const sev = getSeverity(log.type);
                const atk = ATTACK_TYPES.find((a) => a.value === log.type);
                return (
                  <div className="log-entry" key={log.id}>
                    <div className="log-time">
                      {formatTime(log.createdAt).replace(", ", "\n")}
                    </div>
                    <div className="log-type">
                      <span className="log-icon">{atk?.icon ?? "⚡"}</span>
                      {atk?.label ?? log.type}
                    </div>
                    <span
                      className="sev-pill"
                      style={{
                        background: SEVERITY_COLORS[sev] + "22",
                        color: SEVERITY_COLORS[sev],
                      }}
                    >
                      {sev}
                    </span>
                    <div
                      className={`status-dot ${log.success ? "" : "fail"}`}
                    />
                  </div>
                );
              })
            )}
          </section>

          {/* ——— SIDE PANEL ——— */}
          <aside className="side-panel">
            {/* launch attack */}
            <div className="form-card">
              <div className="panel-heading" style={{ marginBottom: 16 }}>
                <h2>Launch Attack</h2>
                <div className="panel-heading-line" />
              </div>

              <label className="form-label">Select Target</label>
              <select
                className="form-select"
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
              >
                <option value="">-- choose target --</option>
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <label className="form-label">Attack Vector</label>
              <div className="type-grid">
                {ATTACK_TYPES.map((a) => (
                  <button
                    key={a.value}
                    className={`type-btn ${attackType === a.value ? "selected" : ""}`}
                    onClick={() => setAttackType(a.value)}
                  >
                    <span className="type-btn-icon">{a.icon}</span>
                    <span className="type-btn-label">{a.label}</span>
                    <span
                      className="type-btn-sev"
                      style={{ color: SEVERITY_COLORS[a.severity] }}
                    >
                      {a.severity}
                    </span>
                  </button>
                ))}
              </div>

              <button
                className="launch-btn"
                onClick={handleSubmit}
                disabled={loading || !selectedTarget || !attackType}
              >
                {scanning && <span className="scan-bar" />}
                {scanning
                  ? "SCANNING TARGET..."
                  : loading
                    ? "DEPLOYING..."
                    : "⚡ LAUNCH ATTACK"}
              </button>

              {submitMsg && (
                <div className={`msg ${submitMsg.ok ? "ok" : "err"}`}>
                  {submitMsg.text}
                </div>
              )}
            </div>

            {/* targets */}
            <div className="targets-card">
              <div className="panel-heading" style={{ marginBottom: 12 }}>
                <h2>Enemy Teams</h2>
                <div className="panel-heading-line" />
              </div>
              {targets.length === 0 ? (
                <p
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 11,
                    color: "#333",
                  }}
                >
                  &gt; No targets detected
                </p>
              ) : (
                targets.map((t) => (
                  <div className="target-row" key={t.id}>
                    <span className="target-name">{t.name}</span>
                    <span className="target-score">{t.score} pts</span>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}