import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { PanelCard } from "@/components/StatCard";
import { CATEGORIES, PERIODICITIES, type Category, type Periodicity } from "@/lib/storage";
import { useIncomes } from "@/hooks/use-app-data";
import { toast } from "sonner";

export const Route = createFileRoute("/adicionar")({
  head: () => ({ meta: [{ title: "Adicionar Receita — Investidor Passivo" }] }),
  component: AddIncome,
});

function AddIncome() {
  const { add } = useIncomes();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    source: "",
    category: "dividendos" as Category,
    invested: "",
    received: "",
    date: new Date().toISOString().slice(0, 10),
    periodicity: "mensal" as Periodicity,
    notes: "",
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.source.trim()) return toast.error("Informe o nome da fonte");
    if (!form.received) return toast.error("Informe o valor recebido");
    add({
      source: form.source.trim(),
      category: form.category,
      invested: parseFloat(form.invested || "0"),
      received: parseFloat(form.received),
      date: form.date,
      periodicity: form.periodicity,
      notes: form.notes,
    });
    toast.success("Receita registrada com sucesso!");
    navigate({ to: "/fontes" });
  };

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <PanelCard title="Nova Receita" subtitle="Cadastre dividendos, aluguéis, juros, cashback e mais.">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome da fonte" className="md:col-span-2">
              <input className={inputCls} placeholder="Ex: ITSA4, Apto Centro..." value={form.source} onChange={(e) => update("source", e.target.value)} />
            </Field>

            <Field label="Categoria">
              <select className={inputCls} value={form.category} onChange={(e) => update("category", e.target.value as Category)}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>

            <Field label="Periodicidade">
              <select className={inputCls} value={form.periodicity} onChange={(e) => update("periodicity", e.target.value as Periodicity)}>
                {PERIODICITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>

            <Field label="Valor investido (R$)">
              <input type="number" step="0.01" className={inputCls} placeholder="0,00" value={form.invested} onChange={(e) => update("invested", e.target.value)} />
            </Field>

            <Field label="Valor recebido (R$)">
              <input type="number" step="0.01" className={inputCls} placeholder="0,00" value={form.received} onChange={(e) => update("received", e.target.value)} />
            </Field>

            <Field label="Data de recebimento" className="md:col-span-2">
              <input type="date" className={inputCls} value={form.date} onChange={(e) => update("date", e.target.value)} />
            </Field>

            <Field label="Observações" className="md:col-span-2">
              <textarea rows={3} className={inputCls} placeholder="Notas internas, estratégia, etc." value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            </Field>

            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <button type="submit" className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground font-medium px-5 py-2.5 rounded-lg shadow-glow hover:opacity-95 transition">
                <Save className="size-4" /> Salvar receita
              </button>
              <button type="button" onClick={() => navigate({ to: "/" })} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-accent transition text-sm">
                <X className="size-4" /> Cancelar
              </button>
            </div>
          </form>
        </PanelCard>
      </motion.div>
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
