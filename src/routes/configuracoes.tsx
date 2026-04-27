import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Moon, Sun } from "lucide-react";
import { PanelCard } from "@/components/StatCard";
import { useSettings } from "@/hooks/use-app-data";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Investidor Passivo" }] }),
  component: Cfg,
});

function Cfg() {
  const { settings, save } = useSettings();
  const { theme, setTheme } = useTheme();
  const [draft, setDraft] = useState(settings);
  useEffect(() => setDraft(settings), [settings]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save({ ...draft, theme });
    toast.success("Configurações salvas!");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PanelCard title="Preferências" subtitle="Personalize sua experiência">
        <form onSubmit={submit} className="space-y-5">
          <Field label="Nome">
            <input className={inputCls} value={draft.userName} onChange={(e) => setDraft({ ...draft, userName: e.target.value })} />
          </Field>

          <Field label="Moeda">
            <select className={inputCls} value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })}>
              <option value="BRL">Real (BRL)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </Field>

          <Field label="Rentabilidade esperada (% a.a.)">
            <input type="number" step="0.1" className={inputCls} value={draft.expectedYield}
              onChange={(e) => setDraft({ ...draft, expectedYield: parseFloat(e.target.value) || 0 })} />
          </Field>

          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tema</span>
            <div className="mt-2 inline-flex rounded-lg border border-border p-1 bg-muted">
              <button type="button" onClick={() => setTheme("light")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${theme === "light" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
                <Sun className="size-4" /> Claro
              </button>
              <button type="button" onClick={() => setTheme("dark")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${theme === "dark" ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
                <Moon className="size-4" /> Escuro
              </button>
            </div>
          </div>

          <button type="submit" className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground font-medium px-5 py-2.5 rounded-lg shadow-glow hover:opacity-95 transition">
            <Save className="size-4" /> Salvar configurações
          </button>
        </form>
      </PanelCard>

      <PanelCard title="Sobre" subtitle="Versão MVP — armazenamento local">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Esta é a versão inicial do <strong className="text-foreground">Investidor Passivo</strong>. Todos os dados ficam apenas no seu navegador (localStorage).</p>
          <p>O código está organizado e preparado para futura integração com autenticação e backend em nuvem.</p>
        </div>
      </PanelCard>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span><div className="mt-1.5">{children}</div></label>;
}
