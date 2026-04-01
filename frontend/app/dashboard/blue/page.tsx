"use client";

import { useEffect, useState } from "react";
import "@/styles/blueteam.css";
import AnnouncementBanner from "@/components/AnnouncementBanner";

const API = "http://localhost:5000";

type DefenseLog = {
  id: string;
  teamId: string;
  type: string;
  success: boolean;
  createdAt: string;
};

type IncomingAttack = {
  id: string;
  attackerId: string;
  targetTeamId: string;
  type: string;
  success: boolean;
  createdAt: string;
};

type MyTeam = {
  id: string;
  name: string;
  role: string;
  score: number;
};

const VULN_TYPES = [
  { value: "SQL_INJECTION", label: "SQL Injection", icon: "💉", color: "#0af" },
  { value: "XSS", label: "Cross-Site Scripting", icon: "🪝", color: "#00e5b0" },
  { value: "AUTH_BYPASS", label: "Auth Bypass", icon: "🔓", color: "#4488ff" },
  {
    value: "MISCONFIG",
    label: "Misconfiguration",
    icon: "⚙️",
    color: "#a78bfa",
  },
];

const ATTACK_SEVERITY: Record<string, string> = {
  SQL_INJECTION: "CRITICAL",
  AUTH_BYPASS: "CRITICAL",
  XSS: "HIGH",
  MISCONFIG: "MEDIUM",
};

const SEV_COLOR: Record<string, string> = {
  CRITICAL: "#ff2244",
  HIGH: "#ff8800",
  MEDIUM: "#ffcc00",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { hour12: false });
}

function getVuln(type: string) {
  return VULN_TYPES.find((v) => v.value === type);
}

export default function BlueTeamDashboard() {
  const [defenseLogs, setDefenseLogs] = useState<DefenseLog[]>([]);
  const [incomingAttacks, setIncomingAttacks] = useState<IncomingAttack[]>([]);
  const [myTeam, setMyTeam] = useState<MyTeam | null>(null);
  const [patchType, setPatchType] = useState("");
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function fetchAll() {
    try {
      const [dRes, aRes, tRes] = await Promise.all([
        fetch(`http://localhost:5000/defense/logs`, {
          credentials: "include",
        }),
        fetch(`http://localhost:5000/defense/attacks`, {
          credentials: "include",
        }),
        fetch(`http://localhost:5000/team/me`, {
          credentials: "include",
        }),
      ]);
      const [dData, aData, tData] = await Promise.all([
        dRes.json(),
        aRes.json(),
        tRes.json(),
      ]);
      setDefenseLogs(Array.isArray(dData) ? dData : []);
      setIncomingAttacks(Array.isArray(aData) ? aData : []);
      if (tData && tData.id) setMyTeam(tData);
    } catch {
      /* silent */
    }
  }

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 12000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePatch() {
    if (!patchType) {
      setMsg({ ok: false, text: "Select a vulnerability to patch." });
      return;
    }
    setLoading(true);
    setDeploying(true);
    setMsg(null);
    await new Promise((r) => setTimeout(r, 1200));
    setDeploying(false);
    try {
      const res = await fetch("http://localhost:5000/defense/patch", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json", // 🔥 REQUIRED
        },
        body: JSON.stringify({ type: patchType }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({
          ok: true,
          text: `✔ PATCH DEPLOYED — ${patchType.replace("_", " ")}`,
        });
        fetchAll();
      } else {
        setMsg({ ok: false, text: data.error ?? "Patch failed." });
      }
    } catch {
      setMsg({ ok: false, text: "Network error." });
    } finally {
      setLoading(false);
    }
  }

  const patchedCount = defenseLogs.filter((d) => d.success).length;
  const criticalIncoming = incomingAttacks.filter(
    (a) => ATTACK_SEVERITY[a.type] === "CRITICAL",
  ).length;
  const systemHealth = Math.max(
    0,
    100 - incomingAttacks.length * 8 + patchedCount * 5,
  );
  const healthClamped = Math.min(100, systemHealth);

  return (
    <>
    <AnnouncementBanner /> 
      <div className="btd">
        {/* ——— TOP BAR ——— */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="badge-blue">🔵 BLUE TEAM</span>
            <h1 className="topbar-title">
              BREACH<span>@</span>TRIX
            </h1>
          </div>
          <div className="topbar-right">
            {myTeam && (
              <div className="team-name-badge">
                <span className="team-name-label">TEAM</span>
                <span className="team-name-value">{myTeam.name}</span>
              </div>
            )}
            <div className="health-bar-wrap">
              <span className="health-label">SYS HEALTH</span>
              <div className="health-track">
                <div
                  className="health-fill"
                  style={{
                    width: `${healthClamped}%`,
                    background:
                      healthClamped > 60
                        ? "#22cc77"
                        : healthClamped > 30
                          ? "#ffaa00"
                          : "#ff2244",
                    boxShadow:
                      healthClamped > 60
                        ? "0 0 8px #22cc77"
                        : healthClamped > 30
                          ? "0 0 8px #ffaa00"
                          : "0 0 8px #ff2244",
                  }}
                />
              </div>
              <span
                className="health-pct"
                style={{
                  color:
                    healthClamped > 60
                      ? "#22cc77"
                      : healthClamped > 30
                        ? "#ffaa00"
                        : "#ff2244",
                }}
              >
                {healthClamped}%
              </span>
            </div>
            <span className="live-dot" />
          </div>
        </header>

        <div className="main-grid">
          {/* ——— STATS ——— */}
          <div className="stats-row">
            <div className="stat-cell">
              <div className="stat-label">Team Score</div>
              <div className="stat-value blue">{myTeam?.score ?? 0}</div>
              <div className="stat-sub">total points</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Patches Deployed</div>
              <div className="stat-value blue">{patchedCount}</div>
              <div className="stat-sub">vulnerabilities fixed</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Incoming Attacks</div>
              <div className="stat-value red">{incomingAttacks.length}</div>
              <div className="stat-sub">threats detected</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Critical Threats</div>
              <div className="stat-value red">{criticalIncoming}</div>
              <div className="stat-sub">high-severity hits</div>
            </div>
          </div>

          {/* ——— LOG PANEL ——— */}
          <section className="log-panel">
            <Tabs incomingAttacks={incomingAttacks} defenseLogs={defenseLogs} />
          </section>

          {/* ——— SIDE PANEL ——— */}
          <aside className="side-panel">
            {/* patch form */}
            <div className="form-card">
              <div className="panel-heading" style={{ marginBottom: 14 }}>
                <h2>Deploy Patch</h2>
                <div className="panel-line" />
              </div>

              <label className="form-label">Select Vulnerability</label>
              <div className="patch-grid">
                {VULN_TYPES.map((v) => (
                  <button
                    key={v.value}
                    className={`patch-btn ${patchType === v.value ? "selected" : ""}`}
                    onClick={() => setPatchType(v.value)}
                  >
                    <span className="patch-btn-icon">{v.icon}</span>
                    <span className="patch-btn-label">{v.label}</span>
                    <span
                      className="patch-btn-color"
                      style={{ color: v.color }}
                    >
                      PATCH
                    </span>
                  </button>
                ))}
              </div>

              <button
                className="deploy-btn"
                onClick={handlePatch}
                disabled={loading || !patchType}
              >
                {deploying && <span className="scan-bar" />}
                {deploying
                  ? "ANALYZING PATCH..."
                  : loading
                    ? "DEPLOYING..."
                    : "🛡 DEPLOY PATCH"}
              </button>

              {msg && (
                <div className={`msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>
              )}
            </div>

            {/* threat breakdown */}
            <div className="threat-card">
              <div className="panel-heading" style={{ marginBottom: 12 }}>
                <h2>Threat Breakdown</h2>
                <div className="panel-line" />
              </div>
              {VULN_TYPES.map((v) => {
                const count = incomingAttacks.filter(
                  (a) => a.type === v.value,
                ).length;
                return (
                  <div className="threat-row" key={v.value}>
                    <span className="threat-type">
                      {v.icon} {v.label}
                    </span>
                    <span className="threat-count">{count}x</span>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

/* ——— TABS COMPONENT ——— */
function Tabs({
  incomingAttacks,
  defenseLogs,
}: {
  incomingAttacks: IncomingAttack[];
  defenseLogs: DefenseLog[];
}) {
  const [tab, setTab] = useState<"incoming" | "defense">("incoming");

  return (
    <>
      <div className="tabs">
        <button
          className={`tab-btn ${tab === "incoming" ? "active" : ""}`}
          onClick={() => setTab("incoming")}
        >
          Incoming Attacks
          {incomingAttacks.length > 0 && (
            <span
              style={{
                marginLeft: 6,
                background: "#ff2244",
                color: "#fff",
                fontSize: 9,
                padding: "1px 5px",
                borderRadius: 2,
                fontFamily: "'Share Tech Mono', monospace",
              }}
            >
              {incomingAttacks.length}
            </span>
          )}
        </button>
        <button
          className={`tab-btn ${tab === "defense" ? "active" : ""}`}
          onClick={() => setTab("defense")}
        >
          Defense Logs
          {defenseLogs.length > 0 && (
            <span
              style={{
                marginLeft: 6,
                background: "#22cc77",
                color: "#fff",
                fontSize: 9,
                padding: "1px 5px",
                borderRadius: 2,
                fontFamily: "'Share Tech Mono', monospace",
              }}
            >
              {defenseLogs.length}
            </span>
          )}
        </button>
      </div>

      {tab === "incoming" ? (
        incomingAttacks.length === 0 ? (
          <div className="empty-state">
            &gt; NO INCOMING THREATS DETECTED
            <br />
            &gt; SYSTEM SECURE
            <br />
            &gt; _
          </div>
        ) : (
          incomingAttacks.map((atk) => {
            const v = getVuln(atk.type);
            const sev = ATTACK_SEVERITY[atk.type] ?? "MEDIUM";
            return (
              <div className="log-entry incoming" key={atk.id}>
                <div className="log-time">
                  {formatTime(atk.createdAt).replace(", ", "\n")}
                </div>
                <div className="log-type">
                  <span className="type-icon">{v?.icon ?? "⚡"}</span>
                  {v?.label ?? atk.type}
                </div>
                <span
                  className="sev-pill"
                  style={{
                    background: SEV_COLOR[sev] + "22",
                    color: SEV_COLOR[sev],
                  }}
                >
                  {sev}
                </span>
                <div className={`status-dot ${atk.success ? "threat" : ""}`} />
              </div>
            );
          })
        )
      ) : defenseLogs.length === 0 ? (
        <div className="empty-state">
          &gt; NO PATCHES DEPLOYED YET
          <br />
          &gt; DEPLOY YOUR FIRST FIX
          <br />
          &gt; _
        </div>
      ) : (
        defenseLogs.map((log) => {
          const v = getVuln(log.type);
          return (
            <div className="log-entry" key={log.id}>
              <div className="log-time">
                {formatTime(log.createdAt).replace(", ", "\n")}
              </div>
              <div className="log-type">
                <span className="type-icon">{v?.icon ?? "🛡"}</span>
                {v?.label ?? log.type}
              </div>
              <span
                className="sev-pill"
                style={{
                  background: "rgba(34,204,119,0.12)",
                  color: "#22cc77",
                }}
              >
                PATCHED
              </span>
              <div className="status-dot" />
            </div>
          );
        })
      )}
    </>
  );
}
