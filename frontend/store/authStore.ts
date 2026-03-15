import { create } from "zustand";

interface AuthState {
  user: any;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  // authStore login
  login: async (username: string, password: string) => {
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 🔑 cookie will be stored
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }

    // ✅ No fetch to /auth/me needed
  },

  register: async (username: string, password: string) => {
    const res = await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 🔑 ensure cookie set by backend
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Registration failed");
    }

    const data = await res.json();

    // Optionally fetch user after registration
    const userRes = await fetch("http://localhost:5000/auth/me", {
      credentials: "include",
    });
    if (!userRes.ok) throw new Error("Failed to fetch user");
    const userData = await userRes.json();

    set({ user: userData });
  },

  logout: async () => {
    await fetch("http://localhost:5000/auth/logout", {
      method: "POST",
      credentials: "include", // delete cookie on backend if implemented
    });
    set({ user: null });
  },
}));
