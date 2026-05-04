import { motion } from "framer-motion";
import { Gauge, Target, Flame, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

interface HeroMetricsProps {
  score: number;            // 0-1000
  scoreDelta: number;       // change since last month
  yearlyForecast: number;   // BRL
  forecastDelta: number;    // % vs last forecast
  firePct: number;          // 0-100
  fireRemaining: number;    // BRL still needed
}

export function HeroMetricsRow({ score, scoreDelta, yearlyForecast, forecastDelta, firePct, fireRemaining }: HeroMetricsProps) {
  const tier = getTier(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-7"
    >
      {/* SCORE */}
      <MetricTile
        icon={<Gauge className="size-4" />}
        label="Score Investidor Passivo"
        accent="gold"
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-display font-bold text-3xl md:text-4xl tracking-tighter tabular leading-none">
              {Math.round(score)}
              <span className="text-base text-white/50 font-medium ml-1">/1000</span>
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: tier.bg, color: tier.fg }}>
              {tier.label}
            </div>
          </div>
          <DeltaBadge value={`${scoreDelta >= 0 ? "+" : ""}${Math.round(scoreDelta)}`} positive={scoreDelta >= 0} />
        </div>
        <ScoreBar pct={(score / 1000) * 100} />
      </MetricTile>

      {/* PREVISÃO ANUAL */}
      <MetricTile
        icon={<Target className="size-4" />}
        label="Previsão de Renda Anual"
        accent="primary"
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-display font-bold text-3xl md:text-4xl tracking-tighter tabular leading-none">
              {formatBRL(yearlyForecast)}
            </div>
            <div className="mt-1.5 text-[10px] uppercase tracking-wider text-white/55 font-semibold">próximos 12 meses</div>
          </div>
          <DeltaBadge value={`${forecastDelta >= 0 ? "+" : ""}${forecastDelta.toFixed(1)}%`} positive={forecastDelta >= 0} />
        </div>
        <div className="mt-3 text-[11px] text-white/60 leading-snug">
          Estimativa baseada na sua média mensal e crescimento recente.
        </div>
      </MetricTile>

      {/* FIRE % */}
      <MetricTile
        icon={<Flame className="size-4" />}
        label="Independência Financeira"
        accent="ember"
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-display font-bold text-3xl md:text-4xl tracking-tighter tabular leading-none">
              {firePct.toFixed(1)}<span className="text-xl text-white/50">%</span>
            </div>
            <div className="mt-1.5 text-[10px] uppercase tracking-wider text-white/55 font-semibold">Fire alcançado</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Faltam</div>
            <div className="text-xs font-display font-semibold tabular text-gold mt-0.5">{formatBRL(fireRemaining)}</div>
          </div>
        </div>
        <ScoreBar pct={Math.min(100, firePct)} accent="fire" />
      </MetricTile>
    </motion.div>
  );
}

function MetricTile({
  icon, label, accent, children,
}: { icon: React.ReactNode; label: string; accent: "gold" | "primary" | "ember"; children: React.ReactNode }) {
  const accentBar = {
    gold: "from-gold via-gold/60 to-transparent",
    primary: "from-primary-glow via-primary/60 to-transparent",
    ember: "from-orange-400 via-rose-400/60 to-transparent",
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/15 p-5 shadow-inset hover:bg-white/[0.09] transition-colors">
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r", accentBar)} />
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/65 font-semibold mb-3">
        <span className="size-7 rounded-lg bg-white/10 grid place-items-center text-white/80">{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}

function DeltaBadge({ value, positive }: { value: string; positive: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-[11px] font-bold tabular px-2 py-1 rounded-lg backdrop-blur",
      positive ? "bg-success/25 text-white border border-success/40" : "bg-destructive/25 text-white border border-destructive/40",
    )}>
      {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {value}
    </span>
  );
}

function ScoreBar({ pct, accent = "primary" }: { pct: number; accent?: "primary" | "fire" }) {
  const grad = accent === "fire"
    ? "from-orange-400 via-rose-400 to-amber-300"
    : "from-primary-glow via-gold to-primary-glow";
  return (
    <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${Math.max(2, pct)}%` }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn("h-full rounded-full bg-gradient-to-r", grad)}
      />
    </div>
  );
}

function getTier(score: number) {
  if (score >= 800) return { label: "Elite", bg: "color-mix(in oklab, var(--color-gold) 30%, transparent)", fg: "oklch(0.95 0.05 85)" };
  if (score >= 600) return { label: "Avançado", bg: "color-mix(in oklab, var(--color-primary) 30%, transparent)", fg: "oklch(0.95 0.05 150)" };
  if (score >= 400) return { label: "Intermediário", bg: "color-mix(in oklab, var(--color-info) 30%, transparent)", fg: "oklch(0.95 0.04 240)" };
  return { label: "Iniciante", bg: "rgba(255,255,255,0.12)", fg: "rgba(255,255,255,0.85)" };
}

/* Helper that derives the metrics from raw data */
export function computeHeroMetrics({
  patrimonio, monthly, yearly, avg, growth, fireGoal, count,
}: {
  patrimonio: number; monthly: number; yearly: number; avg: number;
  growth: number; fireGoal: number; count: number;
}): HeroMetricsProps {
  // Score: pondera consistência (avg), crescimento, diversificação e patrimônio
  const patrimonyScore = Math.min(400, (patrimonio / Math.max(1, fireGoal)) * 400);
  const consistencyScore = Math.min(250, Math.log10(Math.max(1, avg)) * 70);
  const growthScore = Math.min(200, Math.max(0, growth) * 4);
  const diversityScore = Math.min(150, count * 12);
  const score = Math.max(0, patrimonyScore + consistencyScore + growthScore + diversityScore);
  const scoreDelta = (growth / 100) * 40 + (monthly > avg ? 8 : -4);

  const yearlyForecast = avg > 0 ? avg * 12 : yearly;
  const forecastDelta = growth;

  const firePct = fireGoal > 0 ? Math.min(100, (patrimonio / fireGoal) * 100) : 0;
  const fireRemaining = Math.max(0, fireGoal - patrimonio);

  return { score, scoreDelta, yearlyForecast, forecastDelta, firePct, fireRemaining };
}
