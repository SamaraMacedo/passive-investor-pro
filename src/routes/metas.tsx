import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Save } from "lucide-react";
import { PanelCard } from "@/components/StatCard";
import { useGoals, useIncomes } from "@/hooks/use-app-data";
import { formatBRL } from "@/lib/format";
import { currentMonthTotal, currentYearTotal, totalInvested } from "@/lib/analytics";
import { toast } from "sonner";

export const Route = createFileRoute("/metas")({
  head: () => ({ meta: [{ title: "Metas Financeiras — Investidor Passivo" }] }),
  component: GoalsPage,
});

function GoalsPage() {
  const { goals, save } = useGoals();
  const { incomes } = useIncomes();
  const [draft, setDraft] = useState(goals);
  useEffect(() => setDraft(goals), [goals]);

  const month = currentMonthTotal(incomes);
  const year = currentYearTotal(incomes);
  const patrimony = totalInvested(incomes) + year;

  const items = [
    { label: "Renda Passiva Mensal", current: month, target: goals.monthly, color: "from-primary to-primary-glow" },
    { label: "Renda Passiva Anual", current: year, target: goals.yearly, color: "from-info to-primary" },
    { label: "Patrimônio Total", current: patrimony, target: goals.patrimony, color: "from-warning to-primary" },
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save({
      monthly: parseFloat(String(draft.monthly)) || 0,
      yearly: parseFloat(String(draft.yearly)) || 0,
      patrimony: parseFloat(String(draft.patrimony)) || 0,
    });
    toast.success("Metas atualizadas!");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {items.map((g, i) => {
          const pct = g.target > 0 ? Math.min((g.current / g.target) * 100, 100) : 0;
          return (
            <motion.div
              key={g.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card shadow-soft p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{g.label}</div>
                  <div className="text-2xl font-display font-bold mt-1">{formatBRL(g.current)}</div>
                  <div className="text-xs text-muted-foreground">de {formatBRL(g.target)}</div>
                </div>
                <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center"><Target className="size-5" /></div>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${g.color} rounded-full shadow-glow`}
                />
              </div>
              <div className="mt-2 text-right text-xs font-semibold text-primary">{pct.toFixed(1)}%</div>
            </motion.div>
          );
        })}
      </div>

      <PanelCard title="Definir Metas" subtitle="Estabeleça seus objetivos financeiros">
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Meta Mensal (R$)">
            <input type="number" step="0.01" className={inputCls} value={draft.monthly} onChange={(e) => setDraft({ ...draft, monthly: parseFloat(e.target.value) || 0 })} />
          </Field>
          <Field label="Meta Anual (R$)">
            <input type="number" step="0.01" className={inputCls} value={draft.yearly} onChange={(e) => setDraft({ ...draft, yearly: parseFloat(e.target.value) || 0 })} />
          </Field>
          <Field label="Meta Patrimonial (R$)">
            <input type="number" step="0.01" className={inputCls} value={draft.patrimony} onChange={(e) => setDraft({ ...draft, patrimony: parseFloat(e.target.value) || 0 })} />
          </Field>
          <div className="md:col-span-3">
            <button type="submit" className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground font-medium px-5 py-2.5 rounded-lg shadow-glow hover:opacity-95 transition">
              <Save className="size-4" /> Salvar metas
            </button>
          </div>
        </form>
      </PanelCard>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span><div className="mt-1.5">{children}</div></label>;
}
