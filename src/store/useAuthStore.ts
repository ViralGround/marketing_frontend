import { create } from "zustand";
import { Member } from "@/types";

interface AuthState {
  user: Member | null;
  isAuthenticated: boolean;
  setUser: (user: Member) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
