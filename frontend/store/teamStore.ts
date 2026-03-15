import { create } from "zustand";
import api from "@/lib/api";

export const useTeamStore = create((set) => ({
  team: null,

  fetchTeam: async () => {
    try {
      const res = await api.get("/team/me");
      set({ team: res.data });
    } catch (err) {
      console.error("Team fetch failed", err);
    }
  },
}));
