import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart,
} from "recharts";
import { Wallet, TrendingUp, Coins, Activity, Layers, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StatCard, PanelCard } from "@/components/StatCard";
import { useIncomes } from "@/hooks/use-app-data";
import { CATEGORIES, categoryColor, categoryLabel } from "@/lib/storage";
import { formatBRL, formatPct, monthLabel, formatDate } from "@/lib/format";
import {
  totalInvested, currentMonthTotal, currentYearTotal, monthlyAverage,
  growthPct, byMonth, byCategory, patrimonyEvolution,
} from "@/lib/analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard Geral — Investidor Passivo" },
      { name: "description", content: "Visão geral do seu patrimônio, renda passiva e crescimento financeiro." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { incomes } = useIncomes();

  const stats = useMemo(() => ({
    invested: totalInvested(incomes),
    month: currentMonthTotal(incomes),
    year: currentYearTotal(incomes),
    avg: monthlyAverage(incomes),
    growth: growthPct(incomes),
    count: incomes.length,
  }), [incomes]);

  const monthData = useMemo(() => byMonth(incomes).slice(-12).map((m) => ({ name: monthLabel(m.key), valor: m.total })), [incomes]);
  const catData = useMemo(() =>
    byCategory(incomes).map((c) => ({ name: categoryLabel(c.category as never), value: c.total, color: categoryColor(c.category as never) })),
    [incomes]
  );
  const evolution = useMemo(() => patrimonyEvolution(incomes).map((p) => ({ name: monthLabel(p.key), patrimonio: p.value })), [incomes]);
  const recent = useMemo(() => [...incomes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6), [incomes]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 md:p-10 text-primary-foreground shadow-elegant"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-20%,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.2em] opacity-80">Patrimônio Total</div>
          <div className="mt-2 text-4xl md:text-5xl font-display font-bold tracking-tight">{formatBRL(stats.invested + stats.year)}</div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur">
              {stats.growth >= 0 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
              {formatPct(stats.growth)} vs mês anterior
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur">
              <Activity className="size-4" /> {stats.count} ativos
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Investido" value={formatBRL(stats.invested)} icon={<Wallet className="size-5" />} accent="info" delay={0.05} />
        <StatCard label="Renda do Mês" value={formatBRL(stats.month)} hint="Recebido em " icon={<Coins className="size-5" />} accent="success" delay={0.1} />
        <StatCard label="Renda do Ano" value={formatBRL(stats.year)} icon={<TrendingUp className="size-5" />} accent="primary" delay={0.15} />
        <StatCard label="Média Mensal" value={formatBRL(stats.avg)} hint={`Crescimento ${formatPct(stats.growth)}`} icon={<Layers className="size-5" />} accent="warning" delay={0.2} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PanelCard title="Distribuição por Categoria" subtitle="Renda recebida por classe de ativo" className="lg:col-span-1">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
            {catData.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                <span className="text-muted-foreground truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Recebimentos Mensais" subtitle="Últimos 12 meses" className="lg:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData}>
                <defs>
                  <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="valor" fill="url(#barGreen)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>
      </div>

      <PanelCard title="Evolução Patrimonial" subtitle="Acumulado de investido + recebido">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolution}>
              <defs>
                <linearGradient id="areaPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="patrimonio" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#areaPrimary)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      <PanelCard title="Últimos Lançamentos">
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
              {recent.map((r) => (
                <tr key={r.id} className="border-b border-border/60 hover:bg-muted/40 transition-colors">
                  <td className="px-2 py-3 font-medium">{r.source}</td>
                  <td className="px-2 py-3">
                    <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md bg-muted">
                      <span className="size-2 rounded-full" style={{ background: categoryColor(r.category) }} />
                      {categoryLabel(r.category)}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{formatDate(r.date)}</td>
                  <td className="px-2 py-3 text-right font-semibold text-success">{formatBRL(r.received)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum lançamento ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--color-popover-foreground)",
  boxShadow: "var(--shadow-lg)",
};

// Use CATEGORIES to silence unused-import warning if linter flags it
void CATEGORIES;
