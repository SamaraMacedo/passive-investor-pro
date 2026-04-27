import { useEffect, useState, useCallback } from "react";
import { storage, type Income, type Goals, type Settings } from "@/lib/storage";

function useStorageSync<T>(get: () => T): [T, () => void] {
  const [v, setV] = useState<T>(() => get());
  const refresh = useCallback(() => setV(get()), [get]);
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("ip:storage", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("ip:storage", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);
  return [v, refresh];
}

export function useIncomes() {
  const [incomes, refresh] = useStorageSync<Income[]>(storage.getIncomes);
  return {
    incomes,
    refresh,
    add: (i: Omit<Income, "id" | "createdAt">) => storage.addIncome(i),
    update: (id: string, p: Partial<Income>) => storage.updateIncome(id, p),
    remove: (id: string) => storage.deleteIncome(id),
  };
}

export function useGoals() {
  const [goals, refresh] = useStorageSync<Goals>(storage.getGoals);
  return { goals, refresh, save: (g: Goals) => storage.saveGoals(g) };
}

export function useSettings() {
  const [settings, refresh] = useStorageSync<Settings>(storage.getSettings);
  return { settings, refresh, save: (s: Settings) => storage.saveSettings(s) };
}
