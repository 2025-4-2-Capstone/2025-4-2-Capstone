import { create } from "zustand";

export const useUserStore = create((set) => ({
  token: null,
  role: null,

  setToken: (token) => set({ token }),
  setRole: (role) => set({ role }),

  logout: () => set({ token: null, role: null })
}));
