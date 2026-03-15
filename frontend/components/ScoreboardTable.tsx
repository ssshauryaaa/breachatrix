"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function ScoreboardTable() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/team/scoreboard");
      setTeams(res.data);
    };

    load();
  }, []);

  return (
    <table className="w-full text-left">
      <thead className="text-green-400">
        <tr>
          <th>Rank</th>
          <th>Team</th>
          <th>Score</th>
        </tr>
      </thead>

      <tbody>
        {teams.map((t: any, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>{t.name}</td>
            <td>{t.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
