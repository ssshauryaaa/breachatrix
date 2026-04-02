import { create } from "zustand";
import { persist } from "zustand/middleware";
// ✅ Use the env variable
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL2;

interface AuthState {
  user: any;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

  login: async (username: string, password: string) => {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // cookies will be stored
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }

    // fetch the logged-in user
    const userRes = await fetch(`${BACKEND_URL}/auth/me`, {
      credentials: "include",
    });
    if (!userRes.ok) throw new Error("Failed to fetch user");
    const userData = await userRes.json();

    set({ user: userData });
  },

  register: async (username: string, password: string) => {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Registration failed");
    }

    // fetch the user after registration
    const userRes = await fetch(`${BACKEND_URL}/auth/me`, {
      credentials: "include",
    });
    if (!userRes.ok) throw new Error("Failed to fetch user");
    const userData = await userRes.json();

    set({ user: userData });
  },

  logout: async () => {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    set({ user: null });
  },
}));