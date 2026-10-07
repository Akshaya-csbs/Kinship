const THEME_KEY = "kinship.theme";
export const THEME_EVENT = "kinship:theme";

export type Theme = "dark" | "light";

export function getTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  window.dispatchEvent(new CustomEvent(THEME_EVENT));
}
