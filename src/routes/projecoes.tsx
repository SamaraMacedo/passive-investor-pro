import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import { TrendingUp, Calculator } from "lucide-react";
import { StatCard, PanelCard } from "@/components/StatCard";
import { useIncomes, useSettings } from "@/hooks/use-app-data";
import { formatBRL } from "@/lib/format";
import { totalInvested, monthlyAverage } from "@/lib/analytics";

export const Route = createFileRoute("/projecoes")({
  head: () => ({ meta: [{ title: "Projeções Futuras — Investidor Passivo" }] }),
  component: Projections,
});

function Projections() {
  const { incomes } = useIncomes();
  const { settings } = useSettings();

  const baseInvested = totalInvested(incomes);
  const baseMonthly = monthlyAverage(incomes);

  const [monthlyContrib, setMonthlyContrib] = useState(1000);
  const [yieldRate, setYieldRate] = useState(settings.expectedYield);

  const projection = useMemo(() => {
    const data = [];
    let patrimony = baseInvested;
    const monthlyRate = yieldRate / 100 / 12;
    const months = 10 * 12;
    for (let m = 0; m <= months; m++) {
      const year = m / 12;
      data.push({
        year: `Ano ${year.toFixed(0)}`,
        x: m,
        patrimonio: Math.round(patrimony),
        rendaPassiva: Math.round(patrimony * monthlyRate),
      });
      patrimony = patrimony * (1 + monthlyRate) + monthlyContrib;
    }
    return data;
  }, [baseInvested, monthlyContrib, yieldRate]);

  const horizons = [1, 3, 5, 10];
  const cards = horizons.map((h) => {
    const point = projection[h * 12];
    return { h, patrimonio: point?.patrimonio ?? 0, renda: point?.rendaPassiva ?? 0 };
  });

  return (
    <div className="space-y-6">
      <PanelCard title="Simulador de Projeções" subtitle="Calcule seu futuro financeiro com juros compostos">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Field label="Patrimônio inicial">
            <div className="px-3.5 py-2.5 rounded-lg bg-muted text-sm font-semibold">{formatBRL(baseInvested)}</div>
          </Field>
          <Field label="Aporte mensal (R$)">
            <input type="number" className={inputCls} value={monthlyContrib} onChange={(e) => setMonthlyContrib(parseFloat(e.target.value) || 0)} />
          </Field>
          <Field label="Rentabilidade anual (%)">
            <input type="number" step="0.1" className={inputCls} value={yieldRate} onChange={(e) => setYieldRate(parseFloat(e.target.value) || 0)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <StatCard
              key={c.h}
              label={`Em ${c.h} ${c.h === 1 ? "ano" : "anos"}`}
              value={formatBRL(c.patrimonio)}
              hint={`Renda mensal: ${formatBRL(c.renda)}`}
              icon={<Calculator className="size-5" />}
              accent={["primary", "info", "warning", "success"][i] as "primary"}
              delay={i * 0.05}
            />
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Crescimento Patrimonial Projetado" subtitle="10 anos">
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projection}>
              <defs>
                <linearGradient id="proj" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="x" stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => `${(v/12).toFixed(0)}a`} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} labelFormatter={(v) => `Mês ${v}`} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="patrimonio" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#proj)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      <PanelCard title="Renda Passiva Mensal Projetada" subtitle="Baseado na rentabilidade esperada">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projection}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="x" stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => `${(v/12).toFixed(0)}a`} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => `R$${(v/1000).toFixed(1)}k`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} labelFormatter={(v) => `Mês ${v}`} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="rendaPassiva" stroke="var(--color-success)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
          <TrendingUp className="size-4 text-success" />
          Renda atual média: {formatBRL(baseMonthly)}/mês
        </div>
      </PanelCard>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span><div className="mt-1.5">{children}</div></label>;
}
