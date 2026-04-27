import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, PlusCircle, Wallet, FileBarChart2, CalendarRange,
  Target, TrendingUp, Download, Settings as SettingsIcon, Menu, X, Moon, Sun, Sparkles,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useSettings } from "@/hooks/use-app-data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard Geral", icon: LayoutDashboard },
  { to: "/adicionar", label: "Adicionar Receita", icon: PlusCircle },
  { to: "/fontes", label: "Fontes de Renda", icon: Wallet },
  { to: "/relatorio-mensal", label: "Relatório Mensal", icon: FileBarChart2 },
  { to: "/relatorio-anual", label: "Relatório Anual", icon: CalendarRange },
  { to: "/metas", label: "Metas Financeiras", icon: Target },
  { to: "/projecoes", label: "Projeções Futuras", icon: TrendingUp },
  { to: "/exportacoes", label: "Exportações", icon: Download },
  { to: "/configuracoes", label: "Configurações", icon: SettingsIcon },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const { settings } = useSettings();

  const Sidebar = (
    <motion.aside
      initial={false}
      animate={{ width: open ? 264 : 80 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
        <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow shrink-0">
          <Sparkles className="size-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="overflow-hidden">
              <div className="font-display font-bold text-base leading-tight whitespace-nowrap">Investidor</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">Passivo</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-primary-glow shadow-soft"
                  : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              {active && (
                <motion.span
                  layoutId="active-pill"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-primary"
                />
              )}
              <Icon className="size-[18px] shrink-0" />
              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
        >
          <Menu className="size-[18px]" />
          {open && <span>Recolher</span>}
        </button>
      </div>
    </motion.aside>
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      {Sidebar}

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-foreground/40 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed left-0 top-0 bottom-0 w-[264px] bg-sidebar text-sidebar-foreground z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center"><Sparkles className="size-5 text-primary-foreground" /></div>
                  <div>
                    <div className="font-display font-bold">Investidor</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">Passivo</div>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)}><X className="size-5" /></button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV.map((item) => {
                  const active = location.pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                      className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                        active ? "bg-sidebar-accent text-primary-glow" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60")}>
                      <Icon className="size-[18px]" /><span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-30 glass border-b border-border flex items-center px-4 md:px-8 gap-4">
          <button className="md:hidden" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></button>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Olá, {settings.userName}</div>
            <div className="text-sm font-display font-semibold">{currentPageLabel(location.pathname)}</div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            Dados locais
          </div>
          <button
            onClick={toggle}
            className="size-10 grid place-items-center rounded-lg border border-border hover:bg-accent transition-colors"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function currentPageLabel(p: string) {
  return NAV.find((n) => n.to === p)?.label ?? "Investidor Passivo";
}
