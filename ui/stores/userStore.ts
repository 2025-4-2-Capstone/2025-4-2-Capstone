import { create } from "zustand";

interface UserState {
  token: string | null;
  role: string | null;
  username: string | null;

  setToken: (token: string | null) => void;
  setRole: (role: string | null) => void;
  setUsername: (username: string | null) => void;

  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  token: null,
  role: null,
  username: null,

  setToken: (token) => set({ token }),
  setRole: (role) => set({ role }),
  setUsername: (username) => set({ username }),

  logout: () => set({ token: null, role: null, username: null }),
}));
