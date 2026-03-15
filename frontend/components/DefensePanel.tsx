"use client";

import api from "@/lib/api";
import { useState } from "react";

export default function DefensePanel() {
  const [patch, setPatch] = useState("");

  const submitPatch = async () => {
    await api.post("/defense/patch", { patch });
    alert("Patch submitted");
  };

  return (
    <div>
      <input
        value={patch}
        onChange={(e) => setPatch(e.target.value)}
        className="bg-black border border-blue-400 p-2 w-full"
      />

      <button onClick={submitPatch} className="bg-blue-600 mt-3 px-4 py-2">
        Deploy Patch
      </button>
    </div>
  );
}
