"use client";

import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const logout = async () => {
    try {
      await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        credentials: "include", // send cookies
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    // delete token cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Logout</h1>
        <p className="text-gray-400 mb-6">Terminate your session</p>

        <button
          onClick={logout}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
