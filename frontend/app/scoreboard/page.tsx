"use client";

import "./scoreboard.css";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL2
interface Team {
  id: string;
  name: string;
  score: number;
  role: "BLUE" | "RED";
}

const Scoreboard = () => {
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"RED" | "BLUE" | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch(`${API}/team/scoreboard`);

        if (!response.ok) {
          throw new Error("Failed to fetch scoreboard");
        }

        const data = await response.json();

        setTeams(data);
        setLoading(false); // ✅ THIS FIXES THE STUCK LOADING
      } catch (error) {
        console.error("Scoreboard Error:", error);
        setLoading(false);
      }
    };

    const fetchTeam = async () => {
      try {
        const res = await fetch(`${API}/team/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        setRole(data.role);
      } catch (err) {
        console.error("Team fetch error:", err);
      }
    };

    fetchScores();
    fetchTeam();

    const interval = setInterval(fetchScores, 15000);
    return () => clearInterval(interval);
  }, []);

  const goToTeamHome = () => {
    if (role === "BLUE") {
      router.push("/dashboard/blue");
    } else if (role === "RED") {
      router.push("/dashboard/red");
    }
  };

  return (
    <>
      <div className="page-container">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="header">
            <div className="text-[10px] tracking-[5px] text-neutral-500 mb-2 uppercase">
              <span className="blink text-red-600">▮</span> Live Intelligence
              Feed
            </div>
            <h1 className="header-title uppercase">
              Breach<span className="resurgence-accent">@trix</span> SCOREBOARD
            </h1>
            <div className="text-[11px] tracking-[2px] text-neutral-400 uppercase">
              Minds empowered by machines // Rankings
            </div>
            <div className="divider" />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <div className="w-12 h-1px bg-red-600 animate-[load_1.2s_linear_infinite]" />
              <div className="text-[10px] tracking-[4px] text-neutral-500 uppercase">
                Synchronizing...
              </div>
            </div>
          ) : (
            <table className="scoreboard-table">
              <thead>
                <tr className="text-[10px] tracking-[3px] text-neutral-500 uppercase">
                  <th className="pb-4 pl-6 text-left">Rank</th>
                  <th className="pb-4 text-left">Innovator Unit</th>
                  <th className="pb-4 pr-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => {
                  // Logic to determine color if role isn't in DB:
                  // e.g., alternates or based on a specific property
                  const isRed = team.role === "RED";
                  const accentClass = isRed ? "red-glow" : "blue-glow";

                  return (
                    <tr key={team.id} className="row-item group">
                      <td className={`rank-box ${accentClass}`}>{index + 1}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold tracking-wider uppercase">
                            {team.name}
                          </span>
                          <span
                            className={`text-[9px] tracking-widest uppercase opacity-50 ${accentClass}`}
                          >
                            Sector: {isRed ? "Attack" : "Defense"}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-bold text-2xl ${accentClass}`}
                      >
                        {team.score.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Footer UI Decoration */}
          <div className="mt-12 flex justify-between items-center opacity-20">
            <div className="h-[1px] flex-1 bg-white mx-4" />
            <div className="text-[8px] tracking-[4px] uppercase whitespace-nowrap">
              Adapt . Rebuild . Lead
            </div>
            <div className="h-[1px] flex-1 bg-white mx-4" />
          </div>
        </div>
        <div className="flex justify-center mt-10">
          <button
            onClick={goToTeamHome}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 transition text-white font-bold tracking-widest uppercase rounded"
          >
            Redirect to Team Home
          </button>
        </div>
      </div>
    </>
  );
};

export default Scoreboard;
