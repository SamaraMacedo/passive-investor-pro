import { storage } from "@/lib/storage";

// Seed demo data (only if empty) so first impression is impressive.
export function ensureSeed() {
  if (typeof window === "undefined") return;
  const existing = storage.getIncomes();
  if (existing.length > 0) return;

  const today = new Date();
  const mk = (monthsAgo: number, day: number) => {
    const d = new Date(today.getFullYear(), today.getMonth() - monthsAgo, day);
    return d.toISOString().slice(0, 10);
  };

  const seed = [
    { source: "ITSA4", category: "dividendos", invested: 18000, received: 320, periodicity: "trimestral", date: mk(0, 5), notes: "Itaúsa" },
    { source: "BBAS3", category: "dividendos", invested: 22000, received: 540, periodicity: "trimestral", date: mk(0, 12), notes: "Banco do Brasil" },
    { source: "MXRF11", category: "fii", invested: 12000, received: 110, periodicity: "mensal", date: mk(0, 15) },
    { source: "HGLG11", category: "fii", invested: 25000, received: 198, periodicity: "mensal", date: mk(0, 15) },
    { source: "Tesouro IPCA+ 2035", category: "renda_fixa", invested: 30000, received: 425, periodicity: "semestral", date: mk(1, 10) },
    { source: "Apto Centro", category: "aluguel", invested: 280000, received: 2100, periodicity: "mensal", date: mk(0, 8) },
    { source: "Nubank Cashback", category: "cashback", invested: 0, received: 87, periodicity: "mensal", date: mk(0, 28) },
    { source: "MXRF11", category: "fii", invested: 12000, received: 108, periodicity: "mensal", date: mk(1, 15) },
    { source: "HGLG11", category: "fii", invested: 25000, received: 195, periodicity: "mensal", date: mk(1, 15) },
    { source: "Apto Centro", category: "aluguel", invested: 280000, received: 2100, periodicity: "mensal", date: mk(1, 8) },
    { source: "Nubank Cashback", category: "cashback", invested: 0, received: 64, periodicity: "mensal", date: mk(1, 28) },
    { source: "MXRF11", category: "fii", invested: 12000, received: 105, periodicity: "mensal", date: mk(2, 15) },
    { source: "HGLG11", category: "fii", invested: 25000, received: 192, periodicity: "mensal", date: mk(2, 15) },
    { source: "Apto Centro", category: "aluguel", invested: 280000, received: 2050, periodicity: "mensal", date: mk(2, 8) },
    { source: "TAEE11", category: "dividendos", invested: 15000, received: 410, periodicity: "trimestral", date: mk(2, 20) },
    { source: "Apto Centro", category: "aluguel", invested: 280000, received: 2050, periodicity: "mensal", date: mk(3, 8) },
    { source: "MXRF11", category: "fii", invested: 12000, received: 102, periodicity: "mensal", date: mk(3, 15) },
    { source: "Royalties Livro", category: "royalties", invested: 0, received: 320, periodicity: "trimestral", date: mk(3, 25) },
    { source: "Apto Centro", category: "aluguel", invested: 280000, received: 2000, periodicity: "mensal", date: mk(4, 8) },
    { source: "MXRF11", category: "fii", invested: 12000, received: 100, periodicity: "mensal", date: mk(4, 15) },
    { source: "HGLG11", category: "fii", invested: 25000, received: 190, periodicity: "mensal", date: mk(4, 15) },
    { source: "Apto Centro", category: "aluguel", invested: 280000, received: 2000, periodicity: "mensal", date: mk(5, 8) },
    { source: "MXRF11", category: "fii", invested: 12000, received: 98, periodicity: "mensal", date: mk(5, 15) },
  ] as const;

  for (const s of seed) {
    storage.addIncome({
      source: s.source,
      category: s.category as never,
      invested: s.invested,
      received: s.received,
      periodicity: s.periodicity as never,
      date: s.date,
      notes: (s as { notes?: string }).notes,
    });
  }
}
