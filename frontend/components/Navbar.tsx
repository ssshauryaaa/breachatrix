"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-black border-b border-green-500 p-4 flex justify-between">
      <h1 className="text-neonGreen font-mono text-xl">Breach@Trix</h1>

      <div className="space-x-6">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/scoreboard">Scoreboard</Link>
        <Link href="/admin">Admin</Link>
      </div>
    </nav>
  );
}
