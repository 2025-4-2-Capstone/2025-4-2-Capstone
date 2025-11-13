import { create } from "zustand";

interface User {
  username: string;
  role: "admin" | "engineer" | "support" | "user";
}

interface UserState {
  user: User | null;
  setUser: (u: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  // ⭐ 테스트용 기본 사용자
  user: {
    username: "테스트계정",
    role: "user"    // ← 여기서 역할 간단히 바꾸면 됨
  },

  // 역할 바꾸는 함수
  setUser: (u) => set({ user: u }),
  logout: () => set({ user: null }),
}));
