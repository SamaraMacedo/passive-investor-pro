export const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

export const formatNumber = (v: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(v || 0);

export const formatPct = (v: number) =>
  `${v >= 0 ? "+" : ""}${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(v || 0)}%`;

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const monthKey = (iso: string) => iso.slice(0, 7); // yyyy-mm
export const yearKey = (iso: string) => iso.slice(0, 4);

export const monthLabel = (key: string) => {
  const [y, m] = key.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(m, 10) - 1]}/${y.slice(2)}`;
};
