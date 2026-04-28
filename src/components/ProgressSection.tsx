import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Target, Trophy, Flame, Sparkles, TrendingUp, Award, Zap, Crown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatBRL, formatPct } from "@/lib/format";
import type { Income } from "@/lib/storage";
import type { Goals } from "@/lib/storage";
import { byMonth, currentMonthTotal, currentYearTotal, totalInvested, monthlyAverage } from "@/lib/analytics";

/* ============ PATRIMONY PROGRESS BAR ============ */
export function PatrimonyProgressBar({ current, goal }: { current: number; goal: number }) {
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  const remaining = Math.max(0, goal - current);
  const milestones = [25, 50, 75, 100];

  return (
    <div className="relative rounded-2xl border border-border/60 bg-gradient-card p-6 md:p-7 shadow-soft overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            <Crown className="size-3.5 text-gold" /> Rumo à Liberdade Financeira
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="font-display font-bold text-3xl md:text-4xl tabular tracking-tight">
              {formatBRL(current)}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              de <span className="font-semibold text-foreground tabular">{formatBRL(goal)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold shadow-glow"
          >
            <Sparkles className="size-3" /> {pct.toFixed(1)}% conquistado
          </motion.div>
          <div className="mt-1.5 text-[11px] text-muted-foreground">
            Faltam <span className="font-semibold text-foreground tabular">{formatBRL(remaining)}</span>
          </div>
        </div>
      </div>

      {/* Bar */}
      <div className="relative">
        <div className="h-4 rounded-full bg-muted/70 overflow-hidden ring-1 ring-border relative">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-gradient-primary relative shadow-glow"
          >
            <div className="absolute inset-0 animate-shimmer rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-5 rounded-full bg-white shadow-lg ring-2 ring-primary" />
          </motion.div>
        </div>
        {/* milestone ticks */}
        <div className="absolute inset-0 flex justify-between items-center pointer-events-none px-0">
          {milestones.map((m) => (
            <div key={m} className="flex flex-col items-center" style={{ marginLeft: m === 25 ? 0 : 0 }}>
              <div className={cn("w-px h-6 -mt-1", pct >= m ? "bg-primary-glow" : "bg-border")} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        <span>Início</span>
        <span className={cn(pct >= 25 && "text-primary")}>25%</span>
        <span className={cn(pct >= 50 && "text-primary")}>50%</span>
        <span className={cn(pct >= 75 && "text-primary")}>75%</span>
        <span className={cn(pct >= 100 && "text-gold")}>Meta</span>
      </div>
    </div>
  );
}

/* ============ MONTH-OVER-MONTH COMPARISON ============ */
export function MonthComparison({ incomes }: { incomes: Income[] }) {
  const months = byMonth(incomes);
  const last = months[months.length - 1]?.total ?? 0;
  const prev = months[months.length - 2]?.total ?? 0;
  const diff = last - prev;
  const pct = prev > 0 ? (diff / prev) * 100 : last > 0 ? 100 : 0;
  const positive = diff >= 0;

  const max = Math.max(last, prev, 1);

  return (
    <div className="relative rounded-2xl border border-border/60 bg-gradient-card p-6 md:p-7 shadow-soft overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Comparativo Mensal</div>
          <h3 className="mt-1 font-display font-semibold text-base">Mês atual vs. anterior</h3>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220 }}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border",
            positive
              ? "bg-success/10 border-success/30 text-success"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          )}
        >
          {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {formatPct(pct)}
        </motion.div>
      </div>

      <div className="space-y-4">
        <ComparisonBar label="Mês anterior" value={prev} max={max} color="muted" />
        <ComparisonBar label="Mês atual" value={last} max={max} color="primary" highlight />
      </div>

      <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Diferença</div>
        <div className={cn("font-display font-bold tabular", positive ? "text-success" : "text-destructive")}>
          {positive ? "+" : ""}{formatBRL(diff)}
        </div>
      </div>
    </div>
  );
}

function ComparisonBar({ label, value, max, color, highlight }: { label: string; value: number; max: number; color: "primary" | "muted"; highlight?: boolean }) {
  const w = (value / max) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className={cn("text-xs font-medium", highlight ? "text-foreground" : "text-muted-foreground")}>{label}</div>
        <div className={cn("font-display font-semibold tabular text-sm", highlight && "text-primary")}>{formatBRL(value)}</div>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${w}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "h-full rounded-full",
            color === "primary" ? "bg-gradient-primary shadow-glow" : "bg-muted-foreground/40"
          )}
        />
      </div>
    </div>
  );
}

/* ============ ACHIEVEMENT BADGES ============ */
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  unlocked: boolean;
  tone: "primary" | "gold" | "info" | "success";
}

export function AchievementBadges({ incomes, goals }: { incomes: Income[]; goals: Goals }) {
  const month = currentMonthTotal(incomes);
  const year = currentYearTotal(incomes);
  const inv = totalInvested(incomes);
  const months = byMonth(incomes);
  const consecutive = countConsecutiveGrowth(months.map((m) => m.total));

  const items: Achievement[] = [
    {
      id: "monthly",
      title: "Meta Mensal",
      description: `${Math.min(100, (month / (goals.monthly || 1)) * 100).toFixed(0)}% da meta de ${formatBRL(goals.monthly)}`,
      icon: <Target className="size-5" />,
      unlocked: month >= goals.monthly,
      tone: "primary",
    },
    {
      id: "yearly",
      title: "Meta Anual",
      description: `${Math.min(100, (year / (goals.yearly || 1)) * 100).toFixed(0)}% de ${formatBRL(goals.yearly)}`,
      icon: <Trophy className="size-5" />,
      unlocked: year >= goals.yearly,
      tone: "gold",
    },
    {
      id: "streak",
      title: `${consecutive}x Crescendo`,
      description: consecutive >= 2 ? "Meses consecutivos em alta" : "Mantenha o ritmo!",
      icon: <Flame className="size-5" />,
      unlocked: consecutive >= 2,
      tone: "success",
    },
    {
      id: "patrimony",
      title: "Investidor Ativo",
      description: `${formatBRL(inv)} aportados`,
      icon: <Award className="size-5" />,
      unlocked: inv > 0,
      tone: "info",
    },
  ];

  const TONES = {
    primary: { bg: "from-primary/15 to-primary/0", ring: "ring-primary/30", icon: "bg-gradient-primary text-primary-foreground shadow-glow" },
    gold: { bg: "from-gold/20 to-gold/0", ring: "ring-gold/30", icon: "bg-gradient-gold text-gold-foreground shadow-gold" },
    info: { bg: "from-info/15 to-info/0", ring: "ring-info/30", icon: "bg-info text-info-foreground" },
    success: { bg: "from-success/15 to-success/0", ring: "ring-success/30", icon: "bg-success text-success-foreground" },
  } as const;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((a, i) => {
        const t = TONES[a.tone];
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-gradient-card p-5 shadow-soft hover:shadow-xl-soft transition-all",
              a.unlocked ? "border-border/60" : "border-dashed border-border opacity-70"
            )}
          >
            <div className={cn("absolute -top-16 -right-16 size-44 rounded-full bg-gradient-to-br to-transparent blur-2xl opacity-80", t.bg)} />
            <div className="relative flex items-start justify-between">
              <div className={cn(
                "size-12 rounded-2xl grid place-items-center transition-transform group-hover:scale-110 group-hover:rotate-3",
                a.unlocked ? t.icon : "bg-muted text-muted-foreground"
              )}>
                {a.icon}
              </div>
              {a.unlocked && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, delay: 0.2 + i * 0.05 }}
                  className="text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-success/15 text-success border border-success/30"
                >
                  Conquistado
                </motion.div>
              )}
            </div>
            <div className="relative mt-4">
              <div className="font-display font-bold text-base tracking-tight">{a.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{a.description}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function countConsecutiveGrowth(values: number[]) {
  let count = 0;
  for (let i = values.length - 1; i > 0; i--) {
    if (values[i] > values[i - 1]) count++;
    else break;
  }
  return count;
}

/* ============ MOTIVATIONAL INSIGHTS ============ */
export function MotivationalInsights({ incomes, goals }: { incomes: Income[]; goals: Goals }) {
  const insights = generateInsights(incomes, goals);

  return (
    <div className="relative rounded-2xl border border-border/60 bg-gradient-card p-6 md:p-7 shadow-soft overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="absolute -top-20 -right-16 size-56 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative flex items-center gap-3 mb-5">
        <div className="size-10 rounded-xl bg-gradient-gold grid place-items-center shadow-gold">
          <Zap className="size-5 text-gold-foreground" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Insights</div>
          <h3 className="font-display font-semibold text-base">Sua jornada em destaque</h3>
        </div>
      </div>

      <div className="relative space-y-3">
        {insights.map((ins, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.4 }}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/70 transition-colors"
          >
            <div className={cn(
              "size-8 rounded-lg grid place-items-center shrink-0 mt-0.5",
              ins.tone === "success" && "bg-success/15 text-success",
              ins.tone === "primary" && "bg-primary/15 text-primary",
              ins.tone === "gold" && "bg-gold/15 text-gold",
              ins.tone === "info" && "bg-info/15 text-info",
            )}>
              {ins.icon}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">{ins.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{ins.text}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface Insight { title: string; text: string; icon: ReactNode; tone: "primary" | "gold" | "info" | "success" }

function generateInsights(incomes: Income[], goals: Goals): Insight[] {
  const out: Insight[] = [];
  const months = byMonth(incomes);
  const last = months[months.length - 1]?.total ?? 0;
  const prev = months[months.length - 2]?.total ?? 0;
  const avg = monthlyAverage(incomes);
  const year = currentYearTotal(incomes);
  const streak = countConsecutiveGrowth(months.map((m) => m.total));

  if (last > prev && prev > 0) {
    const pct = ((last - prev) / prev) * 100;
    out.push({
      title: `Crescimento de ${pct.toFixed(1)}% este mês 🚀`,
      text: `Você superou o mês anterior em ${formatBRL(last - prev)}. Continue nesse ritmo!`,
      icon: <TrendingUp className="size-4" />, tone: "success",
    });
  }

  if (last > avg && avg > 0) {
    out.push({
      title: "Acima da sua média histórica",
      text: `Este mês está ${(((last - avg) / avg) * 100).toFixed(0)}% acima da média de ${formatBRL(avg)}.`,
      icon: <Sparkles className="size-4" />, tone: "primary",
    });
  }

  if (streak >= 2) {
    out.push({
      title: `${streak} meses consecutivos em alta 🔥`,
      text: "Sua consistência está construindo riqueza real. Disciplina é o segredo.",
      icon: <Flame className="size-4" />, tone: "gold",
    });
  }

  if (goals.yearly > 0) {
    const pct = (year / goals.yearly) * 100;
    if (pct >= 100) {
      out.push({ title: "Meta anual alcançada! 🏆", text: `Você superou ${formatBRL(goals.yearly)} este ano.`, icon: <Trophy className="size-4" />, tone: "gold" });
    } else if (pct >= 50) {
      out.push({
        title: `${pct.toFixed(0)}% da meta anual conquistada`,
        text: `Faltam apenas ${formatBRL(goals.yearly - year)} para realizar seu objetivo de ${formatBRL(goals.yearly)}.`,
        icon: <Target className="size-4" />, tone: "primary",
      });
    }
  }

  if (incomes.length >= 10) {
    out.push({
      title: "Carteira diversificada",
      text: `Você já registrou ${incomes.length} fontes de renda. Diversificação reduz riscos.`,
      icon: <Award className="size-4" />, tone: "info",
    });
  }

  if (out.length === 0) {
    out.push({
      title: "Comece sua jornada hoje",
      text: "Adicione sua primeira receita e veja seu patrimônio crescer mês a mês.",
      icon: <Sparkles className="size-4" />, tone: "primary",
    });
  }

  return out.slice(0, 4);
}
