"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type TeamRole = "RED" | "BLUE";

interface TeamSummary {
  id: string;
  name: string;
  role: TeamRole;
  score: number;
  _count: { members: number };
}

interface DashboardData {
  stats: {
    userCount: number;
    teamCount: number;
    attackCount: number;
    defenseCount: number;
  };
  leaderboard: TeamSummary[];
}

interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  teamMember?: { team: { id: string; name: string; role: TeamRole } } | null;
}

interface AttackLog {
  id: string;
  type: string;
  success: boolean;
  createdAt: string;
  attacker: { id: string; name: string };
  target: { id: string; name: string };
}

interface DefenseLog {
  id: string;
  type: string;
  success: boolean;
  createdAt: string;
  team: { id: string; name: string };
}

interface Team {
  id: string;
  name: string;
  role: TeamRole;
  score: number;
  members: {
    id: string;
    user: { id: string; username: string; role: string };
  }[];
}

type Tab = "overview" | "teams" | "users" | "logs";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div
      style={{
        border: `1px solid #1a1a1a`,
        background: "#050505",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "3px",
          height: "100%",
          background: accent || "#ffffff",
        }}
      />
      <p
        style={{
          color: "#666666",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          margin: "0 0 0.75rem",
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: "#ffffff",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "2.5rem",
          fontWeight: 700,
          margin: 0,
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function Badge({ role }: { role: TeamRole }) {
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "10px",
        letterSpacing: "0.1em",
        padding: "2px 8px",
        border: `1px solid ${role === "RED" ? "#331111" : "#112233"}`,
        color: role === "RED" ? "#ff4444" : "#44aaff",
        background: role === "RED" ? "#1a0808" : "#08101a",
      }}
    >
      {role}
    </span>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            background: "#ffffff",
            borderRadius: "50%",
          }}
        />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "12px",
            letterSpacing: "0.15em",
            color: "#888888",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
      </div>
      {action}
    </div>
  );
}

function GhostButton({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? (danger ? "#1a0808" : "#ffffff") : "transparent",
        border: `1px solid ${danger ? (hover ? "#ff4444" : "#441111") : hover ? "#ffffff" : "#333333"}`,
        color: danger ? "#ff4444" : hover ? "#000000" : "#ffffff",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "11px",
        letterSpacing: "0.1em",
        padding: "5px 12px",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [attackLogs, setAttackLogs] = useState<AttackLog[]>([]);
  const [defenseLogs, setDefenseLogs] = useState<DefenseLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  // Modals
  const [createTeamModal, setCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamRole, setNewTeamRole] = useState<TeamRole>("RED");
  const [assignModal, setAssignModal] = useState<{
    teamId: string;
    teamName: string;
  } | null>(null);
  const [assignUserId, setAssignUserId] = useState("");
  const [scoreModal, setScoreModal] = useState<{
    teamId: string;
    teamName: string;
  } | null>(null);
  const [scoreDelta, setScoreDelta] = useState("");

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDashboard = async () => {
    setLoading(true);
    const r = await fetch(`${API}/admin/dashboard`, {
      credentials: "include",
    });
    const d = await r.json();
    setDashboard(d);
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const r = await fetch(`${API}/admin/users`, { credentials: "include" });
    setUsers(await r.json());
    setLoading(false);
  };

  const fetchTeams = async () => {
    setLoading(true);
    const r = await fetch(`${API}/admin/teams`, { credentials: "include" });
    setTeams(await r.json());
    setLoading(false);
  };

  const fetchLogs = async () => {
    setLoading(true);
    const [a, d] = await Promise.all([
      fetch(`${API}/admin/logs/attacks`, { credentials: "include" }).then((r) =>
        r.json(),
      ),
      fetch(`${API}/admin/logs/defenses`, { credentials: "include" }).then(
        (r) => r.json(),
      ),
    ]);
    setAttackLogs(a);
    setDefenseLogs(d);
    setLoading(false);
  };

  useEffect(() => {
    if (tab === "overview") fetchDashboard();
    if (tab === "users") fetchUsers();
    if (tab === "teams") fetchTeams();
    if (tab === "logs") fetchLogs();
  }, [tab]);

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    const r = await fetch(`${API}/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (r.ok) {
      showToast("User deleted");
      fetchUsers();
    } else showToast("Failed to delete", false);
  };

  const promoteUser = async (id: string) => {
    const r = await fetch(`${API}/admin/users/${id}/promote`, {
      method: "PATCH",
      credentials: "include",
    });
    if (r.ok) {
      showToast("User promoted to admin");
      fetchUsers();
    } else showToast("Failed to promote", false);
  };

  const createTeam = async () => {
    const r = await fetch(`${API}/admin/teams`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeamName, role: newTeamRole }),
    });
    if (r.ok) {
      showToast("Team created");
      setCreateTeamModal(false);
      setNewTeamName("");
      fetchTeams();
    } else showToast("Failed to create team", false);
  };

  const deleteTeam = async (id: string) => {
    if (!confirm("Delete this team and all its data?")) return;
    const r = await fetch(`${API}/admin/teams/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (r.ok) {
      showToast("Team deleted");
      fetchTeams();
    } else showToast("Failed to delete", false);
  };

  const assignUser = async () => {
    if (!assignModal) return;
    const r = await fetch(`${API}/admin/teams/${assignModal.teamId}/members`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: assignUserId }),
    });
    const d = await r.json();
    if (r.ok) {
      showToast("User assigned");
      setAssignModal(null);
      setAssignUserId("");
      fetchTeams();
    } else showToast(d.error || "Failed", false);
  };

  const removeFromTeam = async (teamId: string, userId: string) => {
    const r = await fetch(`${API}/admin/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (r.ok) {
      showToast("Member removed");
      fetchTeams();
    } else showToast("Failed", false);
  };

  const adjustScore = async () => {
    if (!scoreModal) return;
    const r = await fetch(`${API}/admin/teams/${scoreModal.teamId}/score`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta: parseInt(scoreDelta) }),
    });
    if (r.ok) {
      showToast("Score updated");
      setScoreModal(null);
      setScoreDelta("");
      fetchTeams();
    } else showToast("Failed", false);
  };

  const resetScores = async () => {
    if (!confirm("Reset ALL team scores to 0?")) return;
    const r = await fetch(`${API}/admin/scores/reset`, {
      method: "POST",
      credentials: "include",
    });
    if (r.ok) {
      showToast("All scores reset");
      fetchTeams();
    } else showToast("Failed", false);
  };

  const clearLogs = async () => {
    if (!confirm("Clear ALL attack and defense logs? This cannot be undone."))
      return;
    const r = await fetch(`${API}/admin/logs`, {
      method: "DELETE",
      credentials: "include",
    });
    if (r.ok) {
      showToast("Logs cleared");
      fetchLogs();
    } else showToast("Failed", false);
  };

  const inputStyle: React.CSSProperties = {
    background: "#000000",
    border: "1px solid #222222",
    color: "#ffffff",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "13px",
    padding: "8px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const modalOverlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  };

  const modalBox: React.CSSProperties = {
    background: "#050505",
    border: "1px solid #222222",
    padding: "2rem",
    minWidth: "340px",
    position: "relative",
  };

  return (
    <>
      {/* <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #000000; }
        ::-webkit-scrollbar-thumb { background: #222222; }
        input::placeholder { color: #444444; }
        select option { background: #000000; color: #ffffff; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style> */}

      <div
        style={{
          minHeight: "100vh",
          background: "#000000",
          color: "#ffffff",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "fixed",
              top: "1.5rem",
              right: "1.5rem",
              zIndex: 999,
              background: "#000000",
              border: `1px solid ${toast.ok ? "#ffffff" : "#ff4444"}`,
              color: toast.ok ? "#ffffff" : "#ff4444",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "12px",
              padding: "10px 16px",
              animation: "slideIn 0.2s ease",
            }}
          >
            {toast.ok ? "●" : "×"} {toast.msg}
          </div>
        )}

        {/* Header */}
        <header
          style={{
            borderBottom: "1px solid #111111",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "56px",
            position: "sticky",
            top: 0,
            background: "#000000",
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "16px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                BREACH
              </span>
              <span
                style={{
                  color: "#333333",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "16px",
                }}
              >
                /
              </span>
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "16px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 300,
                  letterSpacing: "0.05em",
                }}
              >
                TRIX
              </span>
            </div>
            <span
              style={{
                color: "#222222",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              |
            </span>
            <span
              style={{
                color: "#666666",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.1em",
              }}
            >
              SYSTEM CONTROL
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {loading && (
              <span
                style={{
                  color: "#ffffff",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "11px",
                  animation: "blink 1s infinite",
                }}
              >
                ● PROCESSING
              </span>
            )}
            <span
              style={{
                color: "#444444",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px",
              }}
            >
              {time?.toLocaleTimeString("en-US", { hour12: false })}
            </span>
          </div>
        </header>

        {/* Tabs */}
        <div
          style={{
            borderBottom: "1px solid #111111",
            padding: "0 2rem",
            display: "flex",
          }}
        >
          {(["overview", "teams", "users", "logs"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom:
                  tab === t ? "2px solid #ffffff" : "2px solid transparent",
                color: tab === t ? "#ffffff" : "#444444",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "14px 20px",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <main
          style={{
            padding: "2rem",
            maxWidth: "1400px",
            margin: "0 auto",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {/* ── OVERVIEW ── */}
          {tab === "overview" && dashboard && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "1rem",
                }}
              >
                <StatCard
                  label="Network Nodes"
                  value={dashboard.stats.userCount}
                />
                <StatCard
                  label="Active Squads"
                  value={dashboard.stats.teamCount}
                />
                <StatCard
                  label="Total Incursions"
                  value={dashboard.stats.attackCount}
                />
                <StatCard
                  label="Countermeasures"
                  value={dashboard.stats.defenseCount}
                />
              </div>

              <div>
                <SectionHeader title="Global Standings" />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  {dashboard.leaderboard.map((team, i) => (
                    <div
                      key={team.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "40px 1fr auto auto auto",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "14px 16px",
                        background: i === 0 ? "#111111" : "#050505",
                        border: `1px solid #1a1a1a`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: "13px",
                          color: i === 0 ? "#ffffff" : "#444444",
                        }}
                      >
                        {i + 1 < 10 ? `0${i + 1}` : i + 1}
                      </span>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: "13px",
                          color: "#ffffff",
                        }}
                      >
                        {team.name}
                      </span>
                      <Badge role={team.role} />
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: "11px",
                          color: "#666666",
                        }}
                      >
                        {team._count.members} OPS
                      </span>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#ffffff",
                          minWidth: "60px",
                          textAlign: "right",
                        }}
                      >
                        {team.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TEAMS ── */}
          {tab === "teams" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              <SectionHeader
                title={`Squadrons (${teams.length})`}
                action={
                  <div style={{ display: "flex", gap: "8px" }}>
                    <GhostButton onClick={resetScores} danger>
                      Clear All Scores
                    </GhostButton>
                    <GhostButton onClick={() => setCreateTeamModal(true)}>
                      + Add Squad
                    </GhostButton>
                  </div>
                }
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                  gap: "1rem",
                }}
              >
                {teams.map((team) => (
                  <div
                    key={team.id}
                    style={{
                      border: `1px solid #1a1a1a`,
                      background: "#050505",
                      padding: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <Badge role={team.role} />
                        <p
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: "15px",
                            color: "#ffffff",
                            margin: "8px 0 0",
                            fontWeight: 500,
                          }}
                        >
                          {team.name}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: "28px",
                            fontWeight: 700,
                            color: "#ffffff",
                            margin: 0,
                            lineHeight: 1,
                          }}
                        >
                          {team.score}
                        </p>
                        <p
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: "10px",
                            color: "#444444",
                            margin: "4px 0 0",
                          }}
                        >
                          RATING
                        </p>
                      </div>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      {team.members.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "6px 0",
                            borderBottom: "1px solid #111111",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: "12px",
                              color: "#888888",
                            }}
                          >
                            {m.user.username}
                          </span>
                          <button
                            onClick={() => removeFromTeam(team.id, m.user.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#333333",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <GhostButton
                        onClick={() =>
                          setAssignModal({
                            teamId: team.id,
                            teamName: team.name,
                          })
                        }
                      >
                        Deploy
                      </GhostButton>
                      <GhostButton
                        onClick={() =>
                          setScoreModal({
                            teamId: team.id,
                            teamName: team.name,
                          })
                        }
                      >
                        Mod
                      </GhostButton>
                      <GhostButton onClick={() => deleteTeam(team.id)} danger>
                        Purge
                      </GhostButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div>
              <SectionHeader title={`Identified Personnel (${users.length})`} />
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "12px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                      {["Identifier", "Level", "Assignment", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              padding: "10px 12px",
                              color: "#444444",
                              fontSize: "10px",
                              textTransform: "uppercase",
                              fontWeight: 500,
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        style={{ borderBottom: "1px solid #080808" }}
                      >
                        <td style={{ padding: "12px", color: "#ffffff" }}>
                          {u.username}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              color: u.role === "admin" ? "#ffffff" : "#666666",
                              border: "1px solid #222222",
                              padding: "2px 8px",
                              fontSize: "10px",
                            }}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          {u.teamMember ? (
                            <span style={{ color: "#ffffff" }}>
                              {u.teamMember.team.name}
                            </span>
                          ) : (
                            <span style={{ color: "#222222" }}>UNASSIGNED</span>
                          )}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {u.role !== "admin" && (
                              <GhostButton onClick={() => promoteUser(u.id)}>
                                Elevate
                              </GhostButton>
                            )}
                            <GhostButton
                              onClick={() => deleteUser(u.id)}
                              danger
                            >
                              Terminate
                            </GhostButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── LOGS ── */}
          {tab === "logs" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              <SectionHeader
                title="System Activity"
                action={
                  <GhostButton onClick={clearLogs} danger>
                    Wipe History
                  </GhostButton>
                }
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "10px",
                      color: "#ffffff",
                      letterSpacing: "0.15em",
                      marginBottom: "8px",
                    }}
                  >
                    ● INCURSIONS
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      maxHeight: "500px",
                      overflowY: "auto",
                    }}
                  >
                    {attackLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          background: "#050505",
                          border: "1px solid #111111",
                          padding: "10px 12px",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: "11px",
                            color: "#ffffff",
                            margin: "0 0 4px",
                          }}
                        >
                          {log.type.replace("_", " ")}: {log.attacker?.name} →{" "}
                          {log.target?.name}
                        </p>
                        <span
                          style={{
                            fontSize: "9px",
                            color: "#444444",
                            fontFamily: "'IBM Plex Mono', monospace",
                          }}
                        >
                          {new Date(log.createdAt).toLocaleTimeString()} —{" "}
                          {log.success ? "PENETRATED" : "DEFLECTED"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "10px",
                      color: "#ffffff",
                      letterSpacing: "0.15em",
                      marginBottom: "8px",
                    }}
                  >
                    ● COUNTER-OPS
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      maxHeight: "500px",
                      overflowY: "auto",
                    }}
                  >
                    {defenseLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          background: "#050505",
                          border: "1px solid #111111",
                          padding: "10px 12px",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: "11px",
                            color: "#ffffff",
                            margin: "0 0 4px",
                          }}
                        >
                          {log.type.replace("_", " ")}: {log.team?.name}
                        </p>
                        <span
                          style={{
                            fontSize: "9px",
                            color: "#444444",
                            fontFamily: "'IBM Plex Mono', monospace",
                          }}
                        >
                          {new Date(log.createdAt).toLocaleTimeString()} —{" "}
                          {log.success ? "REINFORCED" : "BYPASSED"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ── CREATE TEAM MODAL ── */}
        {createTeamModal && (
          <div style={modalOverlay} onClick={() => setCreateTeamModal(false)}>
            <div style={modalBox} onClick={(e) => e.stopPropagation()}>
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12px",
                  color: "#ffffff",
                  letterSpacing: "0.15em",
                  margin: "0 0 1.5rem",
                }}
              >
                NEW SQUADRON
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <input
                  style={inputStyle}
                  placeholder="Designation"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
                <select
                  style={inputStyle}
                  value={newTeamRole}
                  onChange={(e) => setNewTeamRole(e.target.value as TeamRole)}
                >
                  <option value="RED">STRIKE (RED)</option>
                  <option value="BLUE">SHIELD (BLUE)</option>
                </select>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "flex-end",
                    marginTop: "8px",
                  }}
                >
                  <GhostButton onClick={() => setCreateTeamModal(false)}>
                    Abort
                  </GhostButton>
                  <GhostButton onClick={createTeam}>Initialize</GhostButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ASSIGN USER MODAL ── */}
        {assignModal && (
          <div style={modalOverlay} onClick={() => setAssignModal(null)}>
            <div style={modalBox} onClick={(e) => e.stopPropagation()}>
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12px",
                  color: "#ffffff",
                  letterSpacing: "0.15em",
                  margin: "0 0 1.5rem",
                }}
              >
                ASSIGN PERSONNEL TO {assignModal.teamName}
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <select
                  style={inputStyle}
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                >
                  <option value="">Select ID…</option>
                  {users
                    .filter((u) => !u.teamMember)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                </select>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "flex-end",
                    marginTop: "8px",
                  }}
                >
                  <GhostButton onClick={() => setAssignModal(null)}>
                    Cancel
                  </GhostButton>
                  <GhostButton onClick={assignUser}>Commit</GhostButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SCORE MODAL ── */}
        {scoreModal && (
          <div style={modalOverlay} onClick={() => setScoreModal(null)}>
            <div style={modalBox} onClick={(e) => e.stopPropagation()}>
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12px",
                  color: "#ffffff",
                  letterSpacing: "0.15em",
                  margin: "0 0 1.5rem",
                }}
              >
                MODIFY RATING: {scoreModal.teamName}
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <input
                  style={inputStyle}
                  type="number"
                  placeholder="Rating Delta"
                  value={scoreDelta}
                  onChange={(e) => setScoreDelta(e.target.value)}
                />
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "flex-end",
                    marginTop: "8px",
                  }}
                >
                  <GhostButton onClick={() => setScoreModal(null)}>
                    Close
                  </GhostButton>
                  <GhostButton onClick={adjustScore}>Update</GhostButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
