import { create } from "zustand";

import { tokenStorage } from "@/api/client";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setSession: (user: User, access: string, refresh: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setSession: (user, access, refresh) => {
    tokenStorage.set(access, refresh);
    set({ user, isLoading: false });
  },
  logout: () => {
    tokenStorage.clear();
    set({ user: null, isLoading: false });
  },
}));
