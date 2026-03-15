"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(username, password);

      // after successful register
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Registration failed. Systems may be offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center h-screen bg-[#F8F9FA] text-gray-900 font-sans">
      <div className="max-w-md w-full px-6">
        <div className="bg-white p-10 shadow-2xl rounded-sm border-t-4 border-red-600">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tighter text-red-600 uppercase italic">
              Breach@trix<span className="text-gray-900">.</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                New Identifier
              </label>
              <input
                className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-red-600 outline-none"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                Security Protocol
              </label>
              <input
                type="password"
                className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-red-600 outline-none"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 font-bold uppercase tracking-widest hover:bg-red-600 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Register Account"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Already integrated?
              <Link
                href="/login"
                className="text-red-600 font-bold ml-2 hover:underline"
              >
                Access Here
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-gray-400 text-xs tracking-wide">
          "Intelligence, both human and artificial."
        </p>
      </div>
    </main>
  );
}
