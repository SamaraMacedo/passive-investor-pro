import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    return storage.getSettings().theme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    const s = storage.getSettings();
    if (s.theme !== theme) storage.saveSettings({ ...s, theme });
  }, [theme]);

  return { theme, setTheme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}
