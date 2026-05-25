const THEME_STORAGE_KEY = "care-app-theme-mode";

export type ThemeMode = "light" | "dark";

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function applyThemeMode(mode: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", mode === "dark");
}

export function saveThemeMode(mode: ThemeMode) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  }
  applyThemeMode(mode);
}

