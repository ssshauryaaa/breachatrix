"use client";

import api from "@/lib/api";
import { useState } from "react";

export default function AttackPanel() {
  const [payload, setPayload] = useState("");

  const sqlAttack = async () => {
    await api.post("/attack/sql", { payload });
    alert("SQL Attack Sent");
  };

  const xssAttack = async () => {
    await api.post("/attack/xss", { payload });
    alert("XSS Attack Sent");
  };

  return (
    <div className="space-y-4">
      <input
        className="w-full p-2 bg-black border border-green-500"
        placeholder="payload"
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
      />

      <button onClick={sqlAttack} className="bg-red-600 px-4 py-2">
        Launch SQL Injection
      </button>

      <button onClick={xssAttack} className="bg-blue-600 px-4 py-2">
        Launch XSS Attack
      </button>
    </div>
  );
}
