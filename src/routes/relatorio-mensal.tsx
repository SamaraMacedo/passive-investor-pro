import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from "recharts";
import { TrendingUp, TrendingDown, Trophy, AlertTriangle } from "lucide-react";
import { StatCard, PanelCard } from "@/components/StatCard";
import { useIncomes } from "@/hooks/use-app-data";
import { formatBRL, formatPct, monthKey, monthLabel, formatDate } from "@/lib/format";
import { bySource, categoryColor, categoryLabel } from "@/lib/storage";

export const Route = createFileRoute("/relatorio-mensal")({
  head: () => ({ meta: [{ title: "Relatório Mensal — Investidor Passivo" }] }),
  component: MonthlyReport,
});

function MonthlyReport() {
  const { incomes } = useIncomes();
  const [selected, setSelected] = useState(() => new Date().toISOString().slice(0, 7));

  const monthsAvailable = useMemo(() => {
    const set = new Set(incomes.map((i) => monthKey(i.date)));
    return [...set].sort().reverse();
  }, [incomes]);

  const monthItems = incomes.filter((i) => monthKey(i.date) === selected);
  const total = monthItems.reduce((s, i) => s + i.received, 0);

  const prevKey = useMemo(() => {
    const [y, m] = selected.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    return d.toISOString().slice(0, 7);
  }, [selected]);

  const prevTotal = incomes.filter((i) => monthKey(i.date) === prevKey).reduce((s, i) => s + i.received, 0);
  const diff = prevTotal === 0 ? (total > 0 ? 100 : 0) : ((total - prevTotal) / prevTotal) * 100;

  const ranking = useMemo(() => bySource(monthItems), [monthItems]);
  const best = ranking[0];
  const worst = ranking[ranking.length - 1];

  const chartData = ranking.slice(0, 8).map((r) => {
    const sample = monthItems.find((i) => i.source === r.source)!;
    return { name: r.source, total: r.total, color: categoryColor(sample.category) };
  });

  return (
    <div className="space-y-6">
      <PanelCard
        title="Relatório Mensal"
        subtitle={`Análise detalhada de ${monthLabel(selected)}`}
        action={
          <select value={selected} onChange={(e) => setSelected(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
            {monthsAvailable.length === 0 && <option value={selected}>{monthLabel(selected)}</option>}
            {monthsAvailable.map((k) => <option key={k} value={k}>{monthLabel(k)}</option>)}
          </select>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Recebido" value={formatBRL(total)} accent="success" icon={<TrendingUp className="size-5" />} />
          <StatCard label="vs. Mês Anterior" value={formatPct(diff)} hint={`Anterior: ${formatBRL(prevTotal)}`} accent={diff >= 0 ? "primary" : "warning"} icon={diff >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />} />
          <StatCard label="Lançamentos" value={monthItems.length} accent="info" />
        </div>
      </PanelCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelCard title="Melhor Pagador" subtitle="Maior receita do mês">
          {best ? (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-success/15 to-transparent border border-success/20">
              <div className="size-14 rounded-xl bg-success/20 grid place-items-center text-success"><Trophy className="size-6" /></div>
              <div className="flex-1">
                <div className="font-display font-bold text-lg">{best.source}</div>
                <div className="text-xs text-muted-foreground">{best.count} lançamento(s)</div>
              </div>
              <div className="text-success font-bold text-xl">{formatBRL(best.total)}</div>
            </div>
          ) : <Empty />}
        </PanelCard>

        <PanelCard title="Menor Pagador" subtitle="Atenção necessária">
          {worst && ranking.length > 1 ? (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-warning/15 to-transparent border border-warning/20">
              <div className="size-14 rounded-xl bg-warning/20 grid place-items-center text-warning"><AlertTriangle className="size-6" /></div>
              <div className="flex-1">
                <div className="font-display font-bold text-lg">{worst.source}</div>
                <div className="text-xs text-muted-foreground">{worst.count} lançamento(s)</div>
              </div>
              <div className="text-warning font-bold text-xl">{formatBRL(worst.total)}</div>
            </div>
          ) : <Empty />}
        </PanelCard>
      </div>

      <PanelCard title="Ranking de Fontes" subtitle="Top 8 do mês">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => `R$${(v/1000).toFixed(1)}k`} />
              <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} width={80} />
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Bar dataKey="total" radius={[0, 8, 8, 0]}>
                {chartData.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      <PanelCard title="Detalhamento do mês">
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b border-border">
                <th className="text-left font-medium px-2 py-2">Fonte</th>
                <th className="text-left font-medium px-2 py-2">Categoria</th>
                <th className="text-left font-medium px-2 py-2">Data</th>
                <th className="text-right font-medium px-2 py-2">Recebido</th>
              </tr>
            </thead>
            <tbody>
              {monthItems.map((i) => (
                <tr key={i.id} className="border-b border-border/50">
                  <td className="px-2 py-2.5 font-medium">{i.source}</td>
                  <td className="px-2 py-2.5"><span className="text-xs px-2 py-1 rounded bg-muted">{categoryLabel(i.category)}</span></td>
                  <td className="px-2 py-2.5 text-muted-foreground">{formatDate(i.date)}</td>
                  <td className="px-2 py-2.5 text-right text-success font-semibold">{formatBRL(i.received)}</td>
                </tr>
              ))}
              {monthItems.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Sem lançamentos neste mês.</td></tr>}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}

function Empty() { return <div className="py-8 text-center text-sm text-muted-foreground">Sem dados.</div>; }
