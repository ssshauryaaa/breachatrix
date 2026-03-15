"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await api.get("/defense/logs");

      setLogs(res.data);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black border border-green-500 p-3">
      {logs.map((log: any, i) => (
        <div key={i} className="text-green-400 text-sm">
          {log.message}
        </div>
      ))}
    </div>
  );
}
