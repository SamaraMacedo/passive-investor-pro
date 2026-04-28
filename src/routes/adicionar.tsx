import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, X, ArrowRight, ArrowLeft, Check, Sparkles,
  TrendingUp, Building2, Landmark, Home, Wallet, Music, MoreHorizontal,
  Calendar, Repeat, FileText, DollarSign, PiggyBank, Tag,
} from "lucide-react";
import { CATEGORIES, PERIODICITIES, type Category, type Periodicity } from "@/lib/storage";
import { useIncomes } from "@/hooks/use-app-data";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/adicionar")({
  head: () => ({ meta: [{ title: "Nova Receita — Investidor Passivo" }] }),
  component: AddIncome,
});

const CATEGORY_ICONS: Record<Category, ReactNode> = {
  dividendos: <TrendingUp className="size-5" />,
  fii: <Building2 className="size-5" />,
  renda_fixa: <Landmark className="size-5" />,
  aluguel: <Home className="size-5" />,
  cashback: <Wallet className="size-5" />,
  royalties: <Music className="size-5" />,
  outros: <MoreHorizontal className="size-5" />,
};

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  dividendos: "Lucros distribuídos por ações",
  fii: "Fundos imobiliários",
  renda_fixa: "CDB, Tesouro, LCI/LCA",
  aluguel: "Imóveis e locações",
  cashback: "Devoluções de compras",
  royalties: "Direitos autorais e licenças",
  outros: "Outras fontes de renda",
};

const STEPS = [
  { id: 1, title: "Categoria", subtitle: "Tipo de receita", icon: <Tag className="size-4" /> },
  { id: 2, title: "Detalhes", subtitle: "Fonte e valores", icon: <DollarSign className="size-4" /> },
  { id: 3, title: "Confirmação", subtitle: "Revisão final", icon: <Check className="size-4" /> },
];

function AddIncome() {
  const { add } = useIncomes();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
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

  const selectedCat = useMemo(() => CATEGORIES.find((c) => c.value === form.category)!, [form.category]);
  const investedNum = parseFloat(form.invested || "0");
  const receivedNum = parseFloat(form.received || "0");
  const yieldPct = investedNum > 0 ? (receivedNum / investedNum) * 100 : 0;

  const canAdvance = useMemo(() => {
    if (step === 1) return !!form.category;
    if (step === 2) return form.source.trim() && form.received && parseFloat(form.received) > 0;
    return true;
  }, [step, form]);

  const next = () => {
    if (!canAdvance) {
      if (step === 2) toast.error("Preencha a fonte e o valor recebido");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = () => {
    if (!form.source.trim()) return toast.error("Informe o nome da fonte");
    if (!form.received) return toast.error("Informe o valor recebido");
    add({
      source: form.source.trim(),
      category: form.category,
      invested: investedNum,
      received: receivedNum,
      date: form.date,
      periodicity: form.periodicity,
      notes: form.notes,
    });
    toast.success("Receita registrada com sucesso! 🎉");
    navigate({ to: "/fontes" });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
          <Sparkles className="size-3.5 text-gold" /> Nova entrada na sua carteira
        </div>
        <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight">Registrar receita passiva</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Em três etapas rápidas, adicione mais um marco da sua jornada financeira.</p>
      </motion.div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {STEPS.map((s, i) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => done && setStep(s.id)}
                  className="flex items-center gap-3 min-w-0"
                >
                  <motion.div
                    animate={{
                      scale: active ? 1.1 : 1,
                    }}
                    className={cn(
                      "size-11 rounded-2xl grid place-items-center font-display font-bold text-sm shrink-0 transition-all duration-300 border",
                      done && "bg-success text-success-foreground border-success shadow-glow",
                      active && "bg-gradient-primary text-primary-foreground border-transparent shadow-glow",
                      !active && !done && "bg-card text-muted-foreground border-border"
                    )}
                  >
                    {done ? <Check className="size-5" /> : s.id}
                  </motion.div>
                  <div className="hidden md:block min-w-0">
                    <div className={cn("text-[10px] uppercase tracking-wider font-semibold", active ? "text-primary" : "text-muted-foreground")}>
                      Etapa {s.id}
                    </div>
                    <div className={cn("text-sm font-semibold truncate", active ? "text-foreground" : done ? "text-foreground/80" : "text-muted-foreground")}>
                      {s.title}
                    </div>
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-3 md:mx-5 h-[2px] rounded-full bg-border overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: step > s.id ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-primary"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card grande */}
      <div className="relative rounded-3xl border border-border/60 bg-gradient-card shadow-elegant overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative p-6 md:p-10 min-h-[480px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionTitle
                  step="01"
                  title="Qual o tipo desta receita?"
                  subtitle="Escolha a categoria que melhor representa essa fonte de renda."
                />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {CATEGORIES.map((c, i) => {
                    const active = form.category === c.value;
                    return (
                      <motion.button
                        key={c.value}
                        type="button"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * i, duration: 0.35 }}
                        whileHover={{ y: -3 }}
                        onClick={() => update("category", c.value)}
                        className={cn(
                          "relative group text-left p-5 rounded-2xl border transition-all overflow-hidden",
                          active
                            ? "border-primary/50 bg-gradient-to-br from-primary/10 to-transparent shadow-glow"
                            : "border-border/60 bg-card hover:border-primary/30 hover:shadow-soft"
                        )}
                      >
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute top-3 right-3 size-6 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-md"
                          >
                            <Check className="size-3.5" strokeWidth={3} />
                          </motion.div>
                        )}
                        <div
                          className="size-11 rounded-xl grid place-items-center mb-3 transition-transform group-hover:scale-110"
                          style={{
                            background: `color-mix(in oklab, ${c.color} 18%, transparent)`,
                            color: c.color,
                          }}
                        >
                          {CATEGORY_ICONS[c.value]}
                        </div>
                        <div className="font-display font-semibold text-sm">{c.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{CATEGORY_DESCRIPTIONS[c.value]}</div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-8">
                  <FieldLabel icon={<Repeat className="size-3.5" />} label="Periodicidade" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PERIODICITIES.map((p) => {
                      const active = form.periodicity === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => update("periodicity", p.value)}
                          className={cn(
                            "px-4 py-2 rounded-full text-xs font-semibold border transition-all",
                            active
                              ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                              : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          )}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionTitle
                  step="02"
                  title="Conte os detalhes da receita"
                  subtitle="Quanto foi investido e quanto retornou — esses números alimentam suas projeções."
                />

                {/* Selected category preview */}
                <div className="mb-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-border bg-muted/40">
                  <div
                    className="size-9 rounded-xl grid place-items-center"
                    style={{ background: `color-mix(in oklab, ${selectedCat.color} 18%, transparent)`, color: selectedCat.color }}
                  >
                    {CATEGORY_ICONS[form.category]}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Categoria selecionada</div>
                    <div className="font-display font-semibold text-sm">{selectedCat.label}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Nome da fonte" icon={<Tag className="size-3.5" />} className="md:col-span-2">
                    <PremiumInput
                      placeholder="Ex: ITSA4, Apto Centro, CDB Banco X..."
                      value={form.source}
                      onChange={(v) => update("source", v)}
                      autoFocus
                    />
                  </Field>

                  <Field label="Valor investido" icon={<PiggyBank className="size-3.5" />} hint="Capital inicial alocado (opcional)">
                    <CurrencyInput value={form.invested} onChange={(v) => update("invested", v)} />
                  </Field>

                  <Field label="Valor recebido" icon={<DollarSign className="size-3.5" />} hint="Quanto entrou na sua conta" required>
                    <CurrencyInput value={form.received} onChange={(v) => update("received", v)} highlight />
                  </Field>

                  <Field label="Data de recebimento" icon={<Calendar className="size-3.5" />}>
                    <PremiumInput type="date" value={form.date} onChange={(v) => update("date", v)} />
                  </Field>

                  <Field label="Yield calculado" icon={<TrendingUp className="size-3.5" />} hint="Rentabilidade automática">
                    <div className="h-12 px-4 rounded-xl bg-muted/50 border border-border flex items-center justify-between">
                      <span className="font-display font-bold text-lg tabular text-primary">
                        {investedNum > 0 ? `${yieldPct.toFixed(2)}%` : "—"}
                      </span>
                      {receivedNum > 0 && (
                        <span className="text-xs text-muted-foreground tabular">+{formatBRL(receivedNum)}</span>
                      )}
                    </div>
                  </Field>

                  <Field label="Observações" icon={<FileText className="size-3.5" />} className="md:col-span-2" hint="Estratégia, fonte de informação, lembretes...">
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                      placeholder="Notas internas..."
                      value={form.notes}
                      onChange={(e) => update("notes", e.target.value)}
                    />
                  </Field>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionTitle
                  step="03"
                  title="Tudo certo para registrar?"
                  subtitle="Revise os dados antes de adicionar à sua carteira."
                />

                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-hero text-primary-foreground p-8 shadow-elegant"
                >
                  <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary-glow/30 blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="size-14 rounded-2xl grid place-items-center bg-white/10 backdrop-blur border border-white/20"
                        style={{ color: selectedCat.color }}
                      >
                        {CATEGORY_ICONS[form.category]}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/70 font-semibold">{selectedCat.label}</div>
                        <div className="font-display font-bold text-xl tracking-tight">{form.source || "Sem nome"}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <ReviewItem label="Recebido" value={formatBRL(receivedNum)} highlight />
                      <ReviewItem label="Investido" value={formatBRL(investedNum)} />
                      <ReviewItem label="Yield" value={investedNum > 0 ? `${yieldPct.toFixed(2)}%` : "—"} />
                      <ReviewItem label="Periodicidade" value={PERIODICITIES.find((p) => p.value === form.periodicity)?.label ?? "—"} />
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">Data</div>
                        <div className="mt-1 font-medium">{new Date(form.date + "T00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</div>
                      </div>
                      {form.notes && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">Observação</div>
                          <div className="mt-1 text-sm text-white/90 line-clamp-2">{form.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                <div className="mt-6 p-4 rounded-2xl bg-success/10 border border-success/20 flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-success/20 grid place-items-center text-success shrink-0">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-success">Mais um passo rumo à liberdade financeira</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Esta receita será adicionada às suas estatísticas e gráficos automaticamente.</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="relative border-t border-border/60 bg-muted/30 px-6 md:px-10 py-5 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-accent text-sm font-medium transition"
            >
              <ArrowLeft className="size-4" /> Voltar
            </button>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-accent text-sm font-medium transition"
            >
              <X className="size-4" /> Cancelar
            </Link>
          )}

          {step < 3 ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={next}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                canAdvance
                  ? "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-xl-soft"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Continuar <ArrowRight className="size-4" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={submit}
              className="relative inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold text-sm shadow-glow hover:shadow-xl-soft transition-all overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-30 transition-opacity" />
              <Save className="size-4 relative" />
              <span className="relative">Salvar receita</span>
              <Sparkles className="size-3.5 relative text-gold" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ step, title, subtitle }: { step: string; title: string; subtitle: string }) {
  return (
    <div className="mb-7">
      <div className="text-[10px] uppercase tracking-[0.22em] text-primary font-bold">Passo {step}</div>
      <h2 className="mt-1.5 font-display font-bold text-2xl md:text-[26px] tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function FieldLabel({ icon, label, required }: { icon?: ReactNode; label: string; required?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
      {icon} <span>{label}</span>
      {required && <span className="text-primary">*</span>}
    </div>
  );
}

function Field({
  label, icon, children, className = "", hint, required,
}: { label: string; icon?: ReactNode; children: ReactNode; className?: string; hint?: string; required?: boolean }) {
  return (
    <div className={className}>
      <FieldLabel icon={icon} label={label} required={required} />
      <div className="mt-2">{children}</div>
      {hint && <div className="mt-1.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function PremiumInput({
  value, onChange, placeholder, type = "text", autoFocus,
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; autoFocus?: boolean }) {
  return (
    <input
      type={type}
      autoFocus={autoFocus}
      className="w-full h-12 px-4 rounded-xl bg-background border border-input text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition placeholder:text-muted-foreground/60"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function CurrencyInput({ value, onChange, highlight }: { value: string; onChange: (v: string) => void; highlight?: boolean }) {
  return (
    <div className={cn(
      "relative h-12 rounded-xl border bg-background transition focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary",
      highlight ? "border-primary/40 ring-1 ring-primary/10" : "border-input"
    )}>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-display font-semibold text-muted-foreground">R$</span>
      <input
        type="number"
        step="0.01"
        inputMode="decimal"
        placeholder="0,00"
        className={cn(
          "w-full h-full pl-11 pr-4 bg-transparent text-right font-display font-bold tabular tracking-tight text-lg focus:outline-none placeholder:text-muted-foreground/40",
          highlight && "text-primary"
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ReviewItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/8 backdrop-blur border border-white/15 p-3.5">
      <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">{label}</div>
      <div className={cn(
        "mt-1 font-display font-bold tabular tracking-tight",
        highlight ? "text-2xl text-gold" : "text-base"
      )}>
        {value}
      </div>
    </div>
  );
}
