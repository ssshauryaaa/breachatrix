"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Team {
  id: string;
  name: string;
  role: "BLUE" | "RED";
  _count?: { members: number };
}
const API = process.env.NEXT_PUBLIC_API_URL2
export default function SelectTeam() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const role = (params.role as string).toUpperCase() as "BLUE" | "RED";
  const isBlue = role === "BLUE";

  // ------------------- CHECK IF USER IS ALREADY IN A TEAM -------------------
  useEffect(() => {
    const checkTeam = async () => {
      try {
        const res = await fetch(`${API}/team/me`, {
          credentials: "include", // sends cookie automatically
        });

        if (!res.ok) throw new Error("Failed to check team");

        const data = await res.json();
        if (data)
          router.push(
            data.role === "BLUE" ? "/dashboard/blue" : "/dashboard/red",
          );
      } catch {
        // User is not in a team yet
      }
    };

    checkTeam();
  }, [router]);

  // ------------------- FETCH TEAMS -------------------
  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/team`, {
          credentials: "include", // sends cookie automatically
        });

        if (!res.ok) throw new Error("Failed to fetch teams");

        const data: Team[] = await res.json();
        setTeams(data.filter((t) => t.role === role));
      } catch {
        setError("Failed to load teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [role]);

  // ------------------- JOIN TEAM -------------------
  const handleJoin = async (teamId: string) => {
    setJoining(teamId);
    setError(null);
    try {
      const res = await fetch(`${API}/team/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send cookie automatically
        body: JSON.stringify({ team_id: teamId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to join");
      }

      router.push(isBlue ? "/dashboard/blue" : "/dashboard/red");
    } catch (err: any) {
      setError(err.message);
      setJoining(null);
    }
  };

  // ------------------- STYLING VARIABLES -------------------
  const accent = isBlue ? "#5ba8ff" : "#ff5555";
  const accentBg = isBlue ? "#1a5fff" : "#e01c1c";
  const glow = isBlue ? "rgba(91,168,255,0.15)" : "rgba(255,85,85,0.15)";
  const gridColor = isBlue ? "rgba(0,120,255,0.04)" : "rgba(255,50,50,0.04)";
  const bg = isBlue ? "#030d1f" : "#1a0303";

  return (
    <>
      <style>{`
        // @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Azeret+Mono:wght@400;500&display=swap');
        // * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: ${bg};
          background-image:
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px);
          background-size: 48px 48px;
          font-family: 'Azeret Mono', monospace;
          color: #fff;
          padding: 60px 40px;
          cursor: default;
        }

        .back-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.4);
          font-family: 'Azeret Mono', monospace;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 8px 16px;
          cursor: pointer;
          margin-bottom: 48px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s, border-color 0.2s;
        }
        .back-btn:hover { color: #fff; border-color: rgba(255,255,255,0.4); }

        .header { margin-bottom: 48px; }

        .header-eyebrow {
          font-size: 10px;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: ${accent};
          margin-bottom: 12px;
        }

        .header-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 7vw, 96px);
          letter-spacing: 8px;
          line-height: 0.9;
          color: ${accent};
        }

        .header-sub {
          margin-top: 16px;
          font-size: 11px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.3);
        }

        .divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, ${accent}44, transparent);
          margin-bottom: 40px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .team-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 28px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.25s, background 0.25s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 20px;
          clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
        }
        .team-card:hover {
          border-color: ${accent}88;
          background: ${glow};
        }
        .team-card:hover .card-glow { opacity: 1; }

        .card-glow {
          position: absolute;
          top: -40px; right: -40px;
          width: 120px; height: 120px;
          border-radius: 50%;
          background: ${accent};
          filter: blur(50px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .team-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 4px;
          color: #fff;
          line-height: 1;
        }

        .member-badge {
          font-size: 10px;
          letter-spacing: 2px;
          color: ${accent};
          border: 1px solid ${accent}55;
          padding: 4px 10px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .member-bar-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .member-bar-label {
          font-size: 9px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
        }

        .member-bar-track {
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,0.08);
          position: relative;
        }
        .member-bar-fill {
          height: 100%;
          background: ${accent};
          transition: width 0.6s ease;
        }

        .join-btn {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 15px;
          letter-spacing: 5px;
          color: #fff;
          background: ${accentBg};
          border: none;
          padding: 11px 0;
          width: 100%;
          cursor: pointer;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          transition: opacity 0.2s, transform 0.15s;
          position: relative;
          z-index: 2;
        }
        .join-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .join-btn:not(:disabled):hover { transform: translateY(-1px); }

        .empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 0;
          font-size: 11px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
        }

        .loading-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 80px 0;
        }
        .loading-bar {
          width: 120px; height: 1px;
          background: rgba(255,255,255,0.08);
          position: relative;
          overflow: hidden;
        }
        .loading-bar::after {
          content: '';
          position: absolute;
          left: -40%; width: 40%; height: 100%;
          background: ${accent};
          animation: load 1.2s linear infinite;
        }
        @keyframes load { to { left: 140%; } }
        .loading-text {
          font-size: 9px;
          letter-spacing: 4px;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
        }

        .err-toast {
          position: fixed;
          bottom: 28px; left: 50%;
          transform: translateX(-50%);
          background: #1a0404;
          border: 1px solid #cc2222;
          color: #ff5555;
          padding: 10px 24px;
          font-size: 11px;
          letter-spacing: 2px;
          z-index: 100;
          font-family: 'Azeret Mono', monospace;
          white-space: nowrap;
        }

        .blink { animation: blink 1.4s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>

      <div className="page">
        <button className="back-btn" onClick={() => router.push("/dashboard")}>
          ← BACK
        </button>

        <div className="header">
          <div className="header-eyebrow">
            <span className="blink">▮</span>&nbsp;
            {isBlue ? "BLUE TEAM — DEFENCE" : "RED TEAM — ATTACK"}
          </div>
          <div className="header-title">
            SELECT
            <br />
            YOUR TEAM
          </div>
          <div className="header-sub">
            CHOOSE A SQUAD TO JOIN AND ENTER THE ARENA
          </div>
        </div>

        <div className="divider" />

        {loading ? (
          <div className="loading-wrap">
            <div className="loading-bar" />
            <div className="loading-text">Loading teams…</div>
          </div>
        ) : (
          <div className="grid">
            {teams.length === 0 ? (
              <div className="empty">
                No {role.toLowerCase()} teams available
              </div>
            ) : (
              teams.map((team) => {
                const count = team._count?.members ?? 0;
                const maxSize = 10; // adjust to your max team size
                const pct = Math.min((count / maxSize) * 100, 100);
                return (
                  <div className="team-card" key={team.id}>
                    <div className="card-glow" />
                    <div className="card-top">
                      <div className="team-name">{team.name}</div>
                      <div className="member-badge">{count} MEMBERS</div>
                    </div>
                    <div className="member-bar-wrap">
                      <div className="member-bar-label">Squad size</div>
                      <div className="member-bar-track">
                        <div
                          className="member-bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <button
                      className="join-btn"
                      disabled={joining === team.id}
                      onClick={() => handleJoin(team.id)}
                    >
                      {joining === team.id ? "JOINING…" : "JOIN SQUAD"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && <div className="err-toast">⚠ {error.toUpperCase()}</div>}
    </>
  );
}
