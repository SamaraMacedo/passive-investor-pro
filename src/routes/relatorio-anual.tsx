import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { Calendar, Trophy, TrendingUp, Activity } from "lucide-react";
import { StatCard, PanelCard } from "@/components/StatCard";
import { useIncomes } from "@/hooks/use-app-data";
import { formatBRL, monthLabel } from "@/lib/format";
import { byMonth } from "@/lib/analytics";

export const Route = createFileRoute("/relatorio-anual")({
  head: () => ({ meta: [{ title: "Relatório Anual — Investidor Passivo" }] }),
  component: YearlyReport,
});

function YearlyReport() {
  const { incomes } = useIncomes();
  const yearsAvail = useMemo(() => [...new Set(incomes.map((i) => i.date.slice(0, 4)))].sort().reverse(), [incomes]);
  const [year, setYear] = useState(() => new Date().getFullYear().toString());

  const yearItems = incomes.filter((i) => i.date.startsWith(year));
  const total = yearItems.reduce((s, i) => s + i.received, 0);

  const months = useMemo(() => {
    const all = byMonth(yearItems);
    // ensure 12 months
    const map = new Map(all.map((m) => [m.key, m.total]));
    const data = [];
    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${String(m).padStart(2, "0")}`;
      data.push({ name: monthLabel(key), valor: map.get(key) ?? 0 });
    }
    return data;
  }, [yearItems, year]);

  const monthsWithData = months.filter((m) => m.valor > 0);
  const avg = monthsWithData.length ? total / monthsWithData.length : 0;
  const best = months.reduce((b, m) => (m.valor > b.valor ? m : b), months[0] ?? { name: "-", valor: 0 });
  const projection = avg * 12 * 1.08; // crescimento estimado 8%

  return (
    <div className="space-y-6">
      <PanelCard
        title="Relatório Anual"
        subtitle={`Performance consolidada de ${year}`}
        action={
          <select value={year} onChange={(e) => setYear(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
            {yearsAvail.length === 0 && <option value={year}>{year}</option>}
            {yearsAvail.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total do Ano" value={formatBRL(total)} icon={<Calendar className="size-5" />} accent="success" />
          <StatCard label="Média Mensal" value={formatBRL(avg)} icon={<Activity className="size-5" />} accent="primary" />
          <StatCard label="Melhor Mês" value={best.name} hint={formatBRL(best.valor)} icon={<Trophy className="size-5" />} accent="warning" />
          <StatCard label="Projeção Próx. Ano" value={formatBRL(projection)} hint="Estimativa +8%" icon={<TrendingUp className="size-5" />} accent="info" />
        </div>
      </PanelCard>

      <PanelCard title="Distribuição por Mês" subtitle={year}>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months}>
              <defs>
                <linearGradient id="yearBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Bar dataKey="valor" fill="url(#yearBar)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      <PanelCard title="Tendência" subtitle="Linha de evolução mensal">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="valor" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-primary)" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>
    </div>
  );
}
