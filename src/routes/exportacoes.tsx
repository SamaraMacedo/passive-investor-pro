import { createFileRoute } from "@tanstack/react-router";
import { FileText, Sheet, Image as ImageIcon, Database, Trash2 } from "lucide-react";
import { PanelCard } from "@/components/StatCard";
import { useIncomes } from "@/hooks/use-app-data";
import { formatBRL, formatDate } from "@/lib/format";
import { categoryLabel, storage } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/exportacoes")({
  head: () => ({ meta: [{ title: "Exportações — Investidor Passivo" }] }),
  component: Exports,
});

function Exports() {
  const { incomes, refresh } = useIncomes();

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.setFillColor(28, 60, 95);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Investidor Passivo", 14, 14);
    doc.setFontSize(10);
    doc.text("Relatório de Renda Passiva", 14, 22);
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 38);
    doc.text(`Total de lançamentos: ${incomes.length}`, 14, 44);
    const total = incomes.reduce((s, i) => s + i.received, 0);
    doc.text(`Total recebido: ${formatBRL(total)}`, 14, 50);

    autoTable(doc, {
      startY: 58,
      head: [["Fonte", "Categoria", "Data", "Investido", "Recebido"]],
      body: incomes.map((i) => [i.source, categoryLabel(i.category), formatDate(i.date), formatBRL(i.invested), formatBRL(i.received)]),
      headStyles: { fillColor: [40, 130, 90] },
      styles: { fontSize: 9 },
    });
    doc.save(`investidor-passivo-${Date.now()}.pdf`);
    toast.success("PDF exportado!");
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const data = incomes.map((i) => ({
      Fonte: i.source,
      Categoria: categoryLabel(i.category),
      Periodicidade: i.periodicity,
      Data: i.date,
      Investido: i.invested,
      Recebido: i.received,
      Observações: i.notes ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receitas");
    XLSX.writeFile(wb, `investidor-passivo-${Date.now()}.xlsx`);
    toast.success("Excel exportado!");
  };

  const exportImage = async () => {
    const html2canvas = (await import("html2canvas")).default;
    const target = document.querySelector("main") as HTMLElement;
    if (!target) return;
    const bg = getComputedStyle(document.body).backgroundColor;
    const canvas = await html2canvas(target, { backgroundColor: bg, scale: 2 });
    const link = document.createElement("a");
    link.download = `investidor-passivo-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Imagem exportada!");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ incomes, goals: storage.getGoals(), settings: storage.getSettings() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `investidor-passivo-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup JSON exportado!");
  };

  const clearAll = () => {
    if (!confirm("Tem certeza? Isso apaga todos os dados locais.")) return;
    storage.saveIncomes([]);
    refresh();
    toast.success("Dados apagados");
  };

  const items = [
    { title: "PDF Profissional", desc: "Relatório completo formatado", icon: FileText, color: "from-destructive/20 to-destructive/0", text: "text-destructive", action: exportPDF },
    { title: "Planilha Excel", desc: "XLSX para análise avançada", icon: Sheet, color: "from-success/20 to-success/0", text: "text-success", action: exportExcel },
    { title: "Imagem do Dashboard", desc: "PNG da página atual", icon: ImageIcon, color: "from-info/20 to-info/0", text: "text-info", action: exportImage },
    { title: "Backup JSON", desc: "Exporta todos os dados", icon: Database, color: "from-warning/20 to-warning/0", text: "text-warning", action: exportJSON },
  ];

  return (
    <div className="space-y-6">
      <PanelCard title="Exportações" subtitle="Baixe seus dados em diferentes formatos">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <button key={it.title} onClick={it.action}
              className="group relative overflow-hidden text-left rounded-2xl border border-border bg-card p-5 hover:shadow-elegant transition-all">
              <div className={`absolute inset-0 bg-gradient-to-br ${it.color} opacity-60 group-hover:opacity-100 transition`} />
              <div className="relative flex items-start gap-4">
                <div className={`size-12 rounded-xl bg-background/70 border border-border grid place-items-center ${it.text}`}>
                  <it.icon className="size-5" />
                </div>
                <div>
                  <div className="font-display font-semibold">{it.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{it.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Zona de Risco" subtitle="Ações irreversíveis">
        <button onClick={clearAll} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition text-sm font-medium">
          <Trash2 className="size-4" /> Apagar todos os dados locais
        </button>
      </PanelCard>
    </div>
  );
}
