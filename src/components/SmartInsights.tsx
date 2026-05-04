import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
  PieChart as PieIcon, Calendar, Zap, ShieldCheck, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import type { Income, Goals } from "@/lib/storage";
import { byCategory, byMonth, currentMonthTotal, monthlyAverage, totalInvested, growthPct } from "@/lib/analytics";
import { formatBRL, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "info" | "primary" | "gold";

interface SmartInsight {
  icon: React.ReactNode;
  title: string;
  text: string;
  tone: Tone;
  metric?: { value: string; positive?: boolean };
}

const TONE_MAP: Record<Tone, { bg: string; icon: string; ring: string }> = {
  success:  { bg: "from-success/15 via-success/5",   icon: "bg-success/15 text-success",       ring: "ring-success/25" },
  warning:  { bg: "from-warning/20 via-warning/5",   icon: "bg-warning/20 text-warning",       ring: "ring-warning/30" },
  info:     { bg: "from-info/15 via-info/5",         icon: "bg-info/15 text-info",             ring: "ring-info/25" },
  primary:  { bg: "from-primary/15 via-primary/5",   icon: "bg-primary/15 text-primary",       ring: "ring-primary/25" },
  gold:     { bg: "from-gold/20 via-gold/5",         icon: "bg-gold/20 text-gold",             ring: "ring-gold/30" },
};

export function SmartInsightsPanel({ incomes, goals }: { incomes: Income[]; goals: Goals }) {
  const insights = useMemo(() => buildSmartInsights(incomes, goals), [incomes, goals]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-card shadow-elegant">
      {/* texture */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-70 pointer-events-none" />
      <div className="absolute -top-32 -right-32 size-80 rounded-full bg-info/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 size-72 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

      <div className="relative p-6 md:p-8">
        <header className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-info to-primary grid place-items-center shadow-glow">
              <Brain className="size-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">Inteligência Financeira</div>
              <h3 className="font-display font-bold text-xl tracking-tight">Insights Automáticos do Mês</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Análises geradas em tempo real a partir da sua carteira</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-border/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success animate-pulse" /> Atualizado agora
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((ins, i) => {
            const t = TONE_MAP[ins.tone];
            return (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2 }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl p-4 ring-1 backdrop-blur-md",
                  "bg-gradient-to-br to-transparent",
                  t.bg, t.ring,
                )}
              >
                <div className="relative flex items-start gap-3">
                  <div className={cn("size-10 rounded-xl grid place-items-center shrink-0 transition-transform group-hover:scale-110", t.icon)}>
                    {ins.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm leading-tight">{ins.title}</h4>
                      {ins.metric && (
                        <span className={cn(
                          "shrink-0 inline-flex items-center gap-0.5 text-[11px] font-bold tabular px-1.5 py-0.5 rounded-md",
                          ins.metric.positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                        )}>
                          {ins.metric.positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                          {ins.metric.value}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{ins.text}</p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function buildSmartInsights(incomes: Income[], goals: Goals): SmartInsight[] {
  const out: SmartInsight[] = [];
  const months = byMonth(incomes);
  const last = months[months.length - 1]?.total ?? 0;
  const prev = months[months.length - 2]?.total ?? 0;
  const avg = monthlyAverage(incomes);
  const month = currentMonthTotal(incomes);
  const inv = totalInvested(incomes);
  const growth = growthPct(incomes);
  const cats = byCategory(incomes);
  const total = cats.reduce((s, c) => s + c.total, 0) || 1;
  const top = [...cats].sort((a, b) => b.total - a.total)[0];
  const concentration = top ? (top.total / total) * 100 : 0;

  // 1) Variação do mês
  if (prev > 0) {
    const positive = last >= prev;
    out.push({
      icon: positive ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />,
      title: positive ? "Receita acima do mês anterior" : "Receita abaixo do mês anterior",
      text: positive
        ? `Você recebeu ${formatBRL(last - prev)} a mais que no mês passado. Mantenha o ritmo de aportes.`
        : `Recuou ${formatBRL(prev - last)} em relação ao mês anterior. Reveja seus pagamentos pendentes.`,
      tone: positive ? "success" : "warning",
      metric: { value: formatPct(growth), positive },
    });
  }

  // 2) Acima da média histórica
  if (avg > 0) {
    const diff = ((month - avg) / avg) * 100;
    out.push({
      icon: <Zap className="size-5" />,
      title: month >= avg ? "Performance acima da média" : "Performance abaixo da média",
      text: `Sua média mensal histórica é ${formatBRL(avg)}. Este mês está ${month >= avg ? "superando" : "abaixo"} esse padrão.`,
      tone: month >= avg ? "primary" : "info",
      metric: { value: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`, positive: diff >= 0 },
    });
  }

  // 3) Concentração de carteira
  if (top) {
    const risk = concentration >= 60;
    out.push({
      icon: risk ? <AlertTriangle className="size-5" /> : <ShieldCheck className="size-5" />,
      title: risk ? "Concentração elevada detectada" : "Carteira bem distribuída",
      text: risk
        ? `${concentration.toFixed(0)}% da sua renda vem de "${top.category}". Considere diversificar para reduzir risco.`
        : `A maior categoria representa ${concentration.toFixed(0)}% — boa diversificação entre fontes de renda.`,
      tone: risk ? "warning" : "success",
    });
  }

  // 4) Projeção anual
  if (avg > 0) {
    const projected = avg * 12;
    out.push({
      icon: <Calendar className="size-5" />,
      title: "Projeção para os próximos 12 meses",
      text: `Mantendo a média atual de ${formatBRL(avg)}/mês, você acumulará cerca de ${formatBRL(projected)} em renda passiva.`,
      tone: "gold",
    });
  }

  // 5) Yield-on-cost
  if (inv > 0 && month > 0) {
    const yoc = (month * 12 / inv) * 100;
    out.push({
      icon: <PieIcon className="size-5" />,
      title: "Yield-on-Cost anualizado",
      text: `Sua carteira rende aproximadamente ${yoc.toFixed(2)}% ao ano sobre o capital investido (${formatBRL(inv)}).`,
      tone: yoc >= 8 ? "success" : "info",
      metric: { value: `${yoc.toFixed(1)}%`, positive: yoc >= 8 },
    });
  }

  // 6) Fallback motivacional
  if (out.length < 4) {
    out.push({
      icon: <Lightbulb className="size-5" />,
      title: "Dica do dia",
      text: "Reinvestir os dividendos recebidos acelera o efeito dos juros compostos. Configure aportes automáticos.",
      tone: "primary",
    });
  }

  return out.slice(0, 6);
}
