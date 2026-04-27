// Storage layer — abstracted to allow future backend swap.
// All data lives in localStorage for now.

export type Category =
  | "dividendos"
  | "fii"
  | "renda_fixa"
  | "aluguel"
  | "cashback"
  | "royalties"
  | "outros";

export type Periodicity = "unica" | "mensal" | "trimestral" | "semestral" | "anual";

export interface Income {
  id: string;
  source: string;
  category: Category;
  invested: number;
  received: number;
  date: string; // ISO yyyy-mm-dd
  periodicity: Periodicity;
  notes?: string;
  createdAt: string;
}

export interface Goals {
  monthly: number;
  yearly: number;
  patrimony: number;
}

export interface Settings {
  theme: "light" | "dark";
  currency: string;
  userName: string;
  expectedYield: number; // anual % esperado p/ projeções
}

const KEYS = {
  incomes: "ip:incomes:v1",
  goals: "ip:goals:v1",
  settings: "ip:settings:v1",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("ip:storage", { detail: { key } }));
}

export const storage = {
  // Incomes
  getIncomes: (): Income[] => read<Income[]>(KEYS.incomes, []),
  saveIncomes: (list: Income[]) => write(KEYS.incomes, list),
  addIncome: (item: Omit<Income, "id" | "createdAt">) => {
    const list = storage.getIncomes();
    const nu: Income = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    storage.saveIncomes([nu, ...list]);
    return nu;
  },
  updateIncome: (id: string, patch: Partial<Income>) => {
    const list = storage.getIncomes().map((i) => (i.id === id ? { ...i, ...patch } : i));
    storage.saveIncomes(list);
  },
  deleteIncome: (id: string) => {
    storage.saveIncomes(storage.getIncomes().filter((i) => i.id !== id));
  },

  // Goals
  getGoals: (): Goals => read<Goals>(KEYS.goals, { monthly: 5000, yearly: 60000, patrimony: 1000000 }),
  saveGoals: (g: Goals) => write(KEYS.goals, g),

  // Settings
  getSettings: (): Settings =>
    read<Settings>(KEYS.settings, { theme: "dark", currency: "BRL", userName: "Investidor", expectedYield: 12 }),
  saveSettings: (s: Settings) => write(KEYS.settings, s),
};

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: "dividendos", label: "Dividendos", color: "var(--chart-1)" },
  { value: "fii", label: "FIIs", color: "var(--chart-2)" },
  { value: "renda_fixa", label: "Renda Fixa", color: "var(--chart-3)" },
  { value: "aluguel", label: "Aluguel", color: "var(--chart-4)" },
  { value: "cashback", label: "Cashback", color: "var(--chart-5)" },
  { value: "royalties", label: "Royalties", color: "oklch(0.6 0.15 200)" },
  { value: "outros", label: "Outros", color: "oklch(0.55 0.04 250)" },
];

export const PERIODICITIES: { value: Periodicity; label: string }[] = [
  { value: "unica", label: "Única" },
  { value: "mensal", label: "Mensal" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

export function categoryLabel(c: Category) {
  return CATEGORIES.find((x) => x.value === c)?.label ?? c;
}
export function categoryColor(c: Category) {
  return CATEGORIES.find((x) => x.value === c)?.color ?? "var(--chart-1)";
}
