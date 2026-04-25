import { create } from "zustand";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  /** 클라이언트 hydration 후 layout 스크립트가 이미 세팅한 <html.dark> 를 읽어 store 와 동기화한다. */
  syncFromDocument: () => void;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const applyTheme = (t: Theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
  try {
    localStorage.setItem("theme", t);
  } catch {
    // private browsing 등으로 localStorage 가 막혀도 toggle 자체는 동작해야 한다.
  }
};

export const useThemeStore = create<ThemeState>((set) => ({
  // SSR 안전 초기값. 클라이언트 마운트 후 syncFromDocument 가 진짜 값으로 교정한다.
  theme: "light",
  syncFromDocument: () =>
    set({
      theme:
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark")
          ? "dark"
          : "light",
    }),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggle: () =>
    set((state) => {
      const next: Theme = state.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      return { theme: next };
    }),
}));
