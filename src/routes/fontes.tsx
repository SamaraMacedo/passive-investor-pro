import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus, Search, Check, X } from "lucide-react";
import { PanelCard } from "@/components/StatCard";
import { useIncomes } from "@/hooks/use-app-data";
import { CATEGORIES, PERIODICITIES, categoryColor, categoryLabel, type Category, type Periodicity } from "@/lib/storage";
import { formatBRL, formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/fontes")({
  head: () => ({ meta: [{ title: "Fontes de Renda — Investidor Passivo" }] }),
  component: Sources,
});

function Sources() {
  const { incomes, update, remove } = useIncomes();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Category | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ source: string; received: string; invested: string; date: string; category: Category; periodicity: Periodicity; notes: string }>({
    source: "", received: "", invested: "", date: "", category: "dividendos", periodicity: "mensal", notes: "",
  });

  const filtered = useMemo(() => {
    return incomes
      .filter((i) => (filter === "all" ? true : i.category === filter))
      .filter((i) => i.source.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [incomes, q, filter]);

  const startEdit = (id: string) => {
    const it = incomes.find((x) => x.id === id);
    if (!it) return;
    setEditingId(id);
    setDraft({
      source: it.source, received: String(it.received), invested: String(it.invested),
      date: it.date, category: it.category, periodicity: it.periodicity, notes: it.notes ?? "",
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    update(editingId, {
      source: draft.source, category: draft.category, periodicity: draft.periodicity,
      received: parseFloat(draft.received || "0"), invested: parseFloat(draft.invested || "0"),
      date: draft.date, notes: draft.notes,
    });
    toast.success("Atualizado");
    setEditingId(null);
  };

  const del = (id: string) => {
    if (!confirm("Excluir esta receita?")) return;
    remove(id);
    toast.success("Removido");
  };

  return (
    <div className="space-y-4">
      <PanelCard
        title="Fontes de Renda"
        subtitle={`${incomes.length} lançamentos`}
        action={
          <Link to="/adicionar" className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg shadow-glow hover:opacity-95 transition">
            <Plus className="size-4" /> Nova
          </Link>
        }
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar fonte..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as Category | "all")}
            className="px-3 py-2.5 rounded-lg bg-background border border-input text-sm">
            <option value="all">Todas categorias</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b border-border">
                <th className="text-left font-medium px-2 py-2">Fonte</th>
                <th className="text-left font-medium px-2 py-2">Categoria</th>
                <th className="text-left font-medium px-2 py-2">Periodicidade</th>
                <th className="text-left font-medium px-2 py-2">Data</th>
                <th className="text-right font-medium px-2 py-2">Investido</th>
                <th className="text-right font-medium px-2 py-2">Recebido</th>
                <th className="text-right font-medium px-2 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => editingId === r.id ? (
                <tr key={r.id} className="bg-muted/40">
                  <td className="px-2 py-2"><input className={editCls} value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} /></td>
                  <td className="px-2 py-2">
                    <select className={editCls} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}>
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select className={editCls} value={draft.periodicity} onChange={(e) => setDraft({ ...draft, periodicity: e.target.value as Periodicity })}>
                      {PERIODICITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2"><input type="date" className={editCls} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></td>
                  <td className="px-2 py-2"><input type="number" className={`${editCls} text-right`} value={draft.invested} onChange={(e) => setDraft({ ...draft, invested: e.target.value })} /></td>
                  <td className="px-2 py-2"><input type="number" className={`${editCls} text-right`} value={draft.received} onChange={(e) => setDraft({ ...draft, received: e.target.value })} /></td>
                  <td className="px-2 py-2 text-right">
                    <button onClick={saveEdit} className="p-1.5 rounded-md hover:bg-success/15 text-success"><Check className="size-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-md hover:bg-muted ml-1"><X className="size-4" /></button>
                  </td>
                </tr>
              ) : (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/40 transition">
                  <td className="px-2 py-3 font-medium">{r.source}</td>
                  <td className="px-2 py-3">
                    <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md bg-muted">
                      <span className="size-2 rounded-full" style={{ background: categoryColor(r.category) }} />
                      {categoryLabel(r.category)}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground capitalize">{r.periodicity}</td>
                  <td className="px-2 py-3 text-muted-foreground">{formatDate(r.date)}</td>
                  <td className="px-2 py-3 text-right text-muted-foreground">{formatBRL(r.invested)}</td>
                  <td className="px-2 py-3 text-right font-semibold text-success">{formatBRL(r.received)}</td>
                  <td className="px-2 py-3 text-right">
                    <button onClick={() => startEdit(r.id)} className="p-1.5 rounded-md hover:bg-info/15 text-info"><Pencil className="size-4" /></button>
                    <button onClick={() => del(r.id)} className="p-1.5 rounded-md hover:bg-destructive/15 text-destructive ml-1"><Trash2 className="size-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Nenhuma fonte encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}

const editCls = "w-full px-2 py-1.5 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
