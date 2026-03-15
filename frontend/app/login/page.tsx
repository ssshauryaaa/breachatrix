"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import AuthRedirect from "@/components/AuthRedirect";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password); // login will set cookie and populate user in state

      // redirect after login
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      alert(
        err.message || "Authentication failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthRedirect>
      <main className="flex items-center justify-center h-screen bg-[#F8F9FA] text-gray-900 font-sans">
        <div className="max-w-md w-full px-6">
          <div className="bg-white p-10 shadow-2xl rounded-sm border-t-4 border-red-600">
            <div className="mb-8">
              <h1 className="text-4xl font-black tracking-tighter text-red-600 uppercase italic">
                Breach@trix<span className="text-gray-900">.</span>
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Innovator Identifier
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
                  Access Key
                </label>
                <input
                  type="password"
                  className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-red-600 outline-none"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-gray-900 text-white py-4 font-bold uppercase tracking-widest hover:bg-red-600 transition disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Enter the New Era"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                Resurgence marks the rise of a new generation. Built for a world
                reshaped by intelligence.
              </p>
            </div>
          </div>
        </div>
      </main>
    </AuthRedirect>
  );
}
