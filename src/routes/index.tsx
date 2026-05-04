import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Area, AreaChart,
} from "recharts";
import { Wallet, TrendingUp, Coins, Layers, ArrowUpRight, ArrowDownRight, Plus, Eye, Sparkles } from "lucide-react";
import { StatCard, PanelCard } from "@/components/StatCard";
import { PatrimonyProgressBar, MonthComparison, AchievementBadges, MotivationalInsights } from "@/components/ProgressSection";
import { HeroMetricsRow, computeHeroMetrics } from "@/components/HeroMetrics";
import { SmartInsightsPanel } from "@/components/SmartInsights";
import { useIncomes, useGoals } from "@/hooks/use-app-data";
import { CATEGORIES, categoryColor, categoryLabel } from "@/lib/storage";
import { formatBRL, formatPct, monthLabel, formatDate } from "@/lib/format";
import {
  totalInvested, currentMonthTotal, currentYearTotal, monthlyAverage,
  growthPct, byMonth, byCategory, patrimonyEvolution,
} from "@/lib/analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Investidor Passivo" },
      { name: "description", content: "Central financeira premium para acompanhar patrimônio, renda passiva e crescimento." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { incomes } = useIncomes();
  const { goals } = useGoals();

  const stats = useMemo(() => ({
    invested: totalInvested(incomes),
    month: currentMonthTotal(incomes),
    year: currentYearTotal(incomes),
    avg: monthlyAverage(incomes),
    growth: growthPct(incomes),
    count: incomes.length,
  }), [incomes]);

  const patrimonio = stats.invested + stats.year;
  const heroMetrics = useMemo(() => computeHeroMetrics({
    patrimonio, monthly: stats.month, yearly: stats.year, avg: stats.avg,
    growth: stats.growth, fireGoal: goals.patrimony, count: stats.count,
  }), [patrimonio, stats, goals.patrimony]);
  const monthData = useMemo(() => byMonth(incomes).slice(-12).map((m) => ({ name: monthLabel(m.key), valor: m.total })), [incomes]);
  const catData = useMemo(() =>
    byCategory(incomes).map((c) => ({ name: categoryLabel(c.category as never), value: c.total, color: categoryColor(c.category as never) })),
    [incomes]
  );
  const evolution = useMemo(() => patrimonyEvolution(incomes).map((p) => ({ name: monthLabel(p.key), patrimonio: p.value })), [incomes]);
  const recent = useMemo(() => [...incomes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6), [incomes]);
  const totalCat = catData.reduce((s, c) => s + c.value, 0) || 1;

  return (
    <div className="space-y-6">
      {/* HERO — Patrimônio em destaque absoluto */}
      <motion.section
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl bg-gradient-hero text-primary-foreground shadow-elegant"
      >
        {/* texturas */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-40 -right-32 size-[500px] rounded-full bg-gradient-to-br from-primary-glow/40 to-transparent blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-20 size-[400px] rounded-full bg-gold/15 blur-3xl" />

        <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 p-8 md:p-12">
          {/* Patrimônio */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-[10px] uppercase tracking-[0.22em] font-semibold">
              <Sparkles className="size-3 text-gold" />
              Patrimônio Consolidado
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
              className="mt-5 font-display font-bold tracking-tighter tabular leading-[0.95]"
            >
              <div className="text-5xl md:text-6xl lg:text-7xl">
                {formatBRL(patrimonio)}
              </div>
            </motion.div>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur border text-xs font-semibold ${stats.growth >= 0 ? "bg-success/20 border-success/40 text-white" : "bg-destructive/20 border-destructive/40"}`}>
                {stats.growth >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                {formatPct(stats.growth)}
                <span className="opacity-70 font-medium">vs. mês anterior</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium">
                <Layers className="size-3.5" /> {stats.count} ativos ativos
              </span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/adicionar" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-secondary text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                <Plus className="size-4" /> Registrar Receita
              </Link>
              <Link to="/relatorio-mensal" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/25 text-sm font-semibold hover:bg-white/15 transition-all">
                <Eye className="size-4" /> Ver Relatório
              </Link>
            </div>
          </div>

          {/* Renda Mensal — destaque secundário */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="relative rounded-2xl bg-white/8 backdrop-blur-xl border border-white/15 p-6 md:p-7 shadow-inset"
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/70 font-semibold">Renda Deste Mês</div>
              <div className="size-9 rounded-xl bg-gradient-gold grid place-items-center shadow-gold">
                <Coins className="size-4 text-gold-foreground" />
              </div>
            </div>
            <div className="mt-4 font-display font-bold tabular text-4xl md:text-5xl tracking-tighter">{formatBRL(stats.month)}</div>
            <div className="mt-2 text-xs text-white/70">Recebido em {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</div>

            <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">Média mensal</div>
                <div className="mt-1 font-display font-semibold text-lg tabular">{formatBRL(stats.avg)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">Acumulado ano</div>
                <div className="mt-1 font-display font-semibold text-lg tabular">{formatBRL(stats.year)}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Métricas inteligentes do hero */}
        <div className="relative px-8 md:px-12 pb-8 md:pb-10 -mt-2">
          <HeroMetricsRow {...heroMetrics} />
        </div>
      </motion.section>


      {/* PROGRESSO PATRIMONIAL */}
      <PatrimonyProgressBar current={patrimonio} goal={goals.patrimony} />

      {/* INSIGHTS AUTOMÁTICOS DO MÊS */}
      <SmartInsightsPanel incomes={incomes} goals={goals} />

      {/* CONQUISTAS */}
      <AchievementBadges incomes={incomes} goals={goals} />

      {/* KPIs secundários */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Investido" value={formatBRL(stats.invested)} icon={<Wallet className="size-5" />} accent="info" delay={0.05} />
        <StatCard label="Renda do Mês" value={formatBRL(stats.month)} hint="Atualizado agora" icon={<Coins className="size-5" />} accent="success" delay={0.1} />
        <StatCard label="Renda do Ano" value={formatBRL(stats.year)} hint={`${stats.count} lançamentos`} icon={<TrendingUp className="size-5" />} accent="primary" delay={0.15} />
        <StatCard label="Média Mensal" value={formatBRL(stats.avg)} hint={`Crescimento ${formatPct(stats.growth)}`} icon={<Layers className="size-5" />} accent="gold" delay={0.2} />
      </div>

      {/* COMPARATIVO + INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MonthComparison incomes={incomes} />
        <MotivationalInsights incomes={incomes} goals={goals} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <PanelCard title="Composição da Carteira" subtitle="Distribuição por classe de ativo" className="lg:col-span-1" variant="glass">
          <div className="relative h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={108} paddingAngle={3} stroke="var(--color-card)" strokeWidth={2}>
                  {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total</div>
                <div className="font-display font-bold text-lg tabular mt-0.5">{formatBRL(totalCat)}</div>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {catData.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-foreground/80 truncate font-medium">{c.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-muted-foreground tabular">{((c.value / totalCat) * 100).toFixed(1)}%</span>
                  <span className="font-semibold tabular">{formatBRL(c.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Recebimentos Mensais" subtitle="Histórico dos últimos 12 meses" className="lg:col-span-2">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData} margin={{ top: 12, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary-glow)" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 6" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
                <Bar dataKey="valor" fill="url(#barGreen)" radius={[10, 10, 2, 2]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>
      </div>

      {/* Evolução */}
      <PanelCard
        title="Evolução Patrimonial"
        subtitle="Acumulado de capital investido + renda recebida ao longo do tempo"
        action={
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-[11px] font-semibold text-success">
            <ArrowUpRight className="size-3" /> Trajetória ascendente
          </div>
        }
        variant="spotlight"
      >
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolution} margin={{ top: 12, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="patrimonio" stroke="var(--color-primary)" strokeWidth={3} fill="url(#areaPrimary)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      {/* Lançamentos */}
      <PanelCard
        title="Últimos Lançamentos"
        subtitle="Movimentações recentes da sua carteira"
        action={
          <Link to="/fontes" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
            Ver todos <ArrowUpRight className="size-3" />
          </Link>
        }
      >
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left font-semibold px-3 py-3">Fonte</th>
                <th className="text-left font-semibold px-3 py-3">Categoria</th>
                <th className="text-left font-semibold px-3 py-3">Data</th>
                <th className="text-right font-semibold px-3 py-3">Recebido</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                  className="border-b border-border/40 hover:bg-muted/40 transition-colors"
                >
                  <td className="px-3 py-3.5 font-semibold">{r.source}</td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex items-center gap-2 text-[11px] px-2.5 py-1 rounded-full bg-muted border border-border font-medium">
                      <span className="size-2 rounded-full" style={{ background: categoryColor(r.category) }} />
                      {categoryLabel(r.category)}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-muted-foreground tabular">{formatDate(r.date)}</td>
                  <td className="px-3 py-3.5 text-right font-bold text-success tabular">+{formatBRL(r.received)}</td>
                </motion.tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">Nenhum lançamento ainda.</td></tr>
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
  borderRadius: 14,
  fontSize: 12,
  padding: "10px 14px",
  color: "var(--color-popover-foreground)",
  boxShadow: "var(--shadow-lg)",
};

void CATEGORIES;
