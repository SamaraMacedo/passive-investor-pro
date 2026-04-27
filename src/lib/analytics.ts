import type { Income } from "./storage";
import { monthKey } from "./format";

export interface MonthAgg {
  key: string;
  total: number;
  count: number;
}

export function totalReceived(items: Income[]) {
  return items.reduce((s, i) => s + (i.received || 0), 0);
}
export function totalInvested(items: Income[]) {
  return items.reduce((s, i) => s + (i.invested || 0), 0);
}

export function byMonth(items: Income[]): MonthAgg[] {
  const map = new Map<string, MonthAgg>();
  for (const i of items) {
    const k = monthKey(i.date);
    const cur = map.get(k) ?? { key: k, total: 0, count: 0 };
    cur.total += i.received || 0;
    cur.count += 1;
    map.set(k, cur);
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function byCategory(items: Income[]) {
  const map = new Map<string, number>();
  for (const i of items) map.set(i.category, (map.get(i.category) ?? 0) + (i.received || 0));
  return [...map.entries()].map(([category, total]) => ({ category, total }));
}

export function bySource(items: Income[]) {
  const map = new Map<string, { source: string; total: number; count: number }>();
  for (const i of items) {
    const cur = map.get(i.source) ?? { source: i.source, total: 0, count: 0 };
    cur.total += i.received || 0;
    cur.count += 1;
    map.set(i.source, cur);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function currentMonthTotal(items: Income[]) {
  const k = new Date().toISOString().slice(0, 7);
  return items.filter((i) => monthKey(i.date) === k).reduce((s, i) => s + i.received, 0);
}

export function currentYearTotal(items: Income[]) {
  const y = new Date().getFullYear().toString();
  return items.filter((i) => i.date.startsWith(y)).reduce((s, i) => s + i.received, 0);
}

export function monthlyAverage(items: Income[]) {
  const m = byMonth(items);
  if (m.length === 0) return 0;
  return m.reduce((s, x) => s + x.total, 0) / m.length;
}

export function growthPct(items: Income[]) {
  const m = byMonth(items);
  if (m.length < 2) return 0;
  const last = m[m.length - 1].total;
  const prev = m[m.length - 2].total;
  if (prev === 0) return last > 0 ? 100 : 0;
  return ((last - prev) / prev) * 100;
}

export function patrimonyEvolution(items: Income[]) {
  // cumulative invested + received over months
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  let cum = 0;
  const map = new Map<string, number>();
  for (const i of sorted) {
    cum += (i.invested || 0) + (i.received || 0);
    map.set(monthKey(i.date), cum);
  }
  return [...map.entries()].map(([key, value]) => ({ key, value }));
}
