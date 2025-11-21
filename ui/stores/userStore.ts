"use client";

import { create } from "zustand";

interface UserState {
  token: string | null;
  username: string | null;
  role: string | null;
  department_id: number | null;
  login: (data: any) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  token: null,
  username: null,
  role: null,
  department_id: null,

  login: (data) =>
    set(() => ({
      token: data.access_token,
      username: data.username,
      role: data.role,
      department_id: data.department_id,
    })),

  logout: () =>
    set(() => ({
      token: null,
      username: null,
      role: null,
      department_id: null,
    })),
}));
