import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, PlusCircle, Wallet, FileBarChart2, CalendarRange,
  Target, TrendingUp, Download, Settings as SettingsIcon, Menu, X, Moon, Sun, Gem, ChevronLeft, Search, Bell,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useSettings } from "@/hooks/use-app-data";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

type NavItem = {
  to: "/" | "/adicionar" | "/fontes" | "/relatorio-mensal" | "/relatorio-anual" | "/projecoes" | "/metas" | "/exportacoes" | "/configuracoes";
  label: string;
  icon: typeof LayoutDashboard;
};
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Visão",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/adicionar", label: "Nova Receita", icon: PlusCircle },
      { to: "/fontes", label: "Fontes de Renda", icon: Wallet },
    ],
  },
  {
    label: "Análise",
    items: [
      { to: "/relatorio-mensal", label: "Relatório Mensal", icon: FileBarChart2 },
      { to: "/relatorio-anual", label: "Relatório Anual", icon: CalendarRange },
      { to: "/projecoes", label: "Projeções", icon: TrendingUp },
    ],
  },
  {
    label: "Estratégia",
    items: [
      { to: "/metas", label: "Metas", icon: Target },
      { to: "/exportacoes", label: "Exportações", icon: Download },
      { to: "/configuracoes", label: "Configurações", icon: SettingsIcon },
    ],
  },
];

const ALL_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const { settings } = useSettings();

  const Sidebar = (
    <motion.aside
      initial={false}
      animate={{ width: open ? 280 : 84 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0 overflow-hidden relative"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-40 -left-20 size-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 size-80 rounded-full bg-gold/8 blur-3xl" />
      </div>

      {/* Brand */}
      <div className="relative flex items-center gap-3 px-5 h-20 border-b border-sidebar-border/60">
        <div className="relative size-11 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow shrink-0">
          <Gem className="size-5 text-primary-foreground" strokeWidth={2.2} />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="overflow-hidden">
              <div className="font-display font-bold text-[17px] leading-none whitespace-nowrap tracking-tight">Investidor</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-gold/90 font-semibold">Passivo · Premium</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-5 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && "mt-6")}>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/40 font-semibold"
                >
                  {group.label}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all",
                      active
                        ? "text-primary-glow bg-sidebar-accent/80 shadow-inset"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="active-pill"
                        transition={{ type: "spring", stiffness: 350, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent ring-1 ring-primary/20"
                      />
                    )}
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-gradient-to-b from-primary-glow to-primary shadow-glow" />
                    )}
                    <Icon className={cn("size-[18px] shrink-0 relative z-10 transition-transform group-hover:scale-110", active && "text-primary-glow")} strokeWidth={active ? 2.2 : 1.8} />
                    <AnimatePresence>
                      {open && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="whitespace-nowrap relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer card */}
      <div className="relative p-3 border-t border-sidebar-border/60">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-3 mx-1 p-3 rounded-xl bg-gradient-to-br from-sidebar-accent/80 to-sidebar-accent/30 border border-sidebar-border ring-1 ring-white/5"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full bg-gradient-gold grid place-items-center text-gold-foreground font-display font-bold text-sm shadow-gold">
                  {settings.userName?.[0]?.toUpperCase() ?? "I"}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold truncate">{settings.userName}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gold/80 font-medium">Conta Premium</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors"
        >
          <ChevronLeft className={cn("size-4 transition-transform", !open && "rotate-180")} />
          {open && <span>Recolher menu</span>}
        </button>
      </div>
    </motion.aside>
  );

  return (
    <div className="min-h-screen flex w-full bg-background bg-gradient-mesh">
      {Sidebar}

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar text-sidebar-foreground z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-20 border-b border-sidebar-border/60">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow"><Gem className="size-5 text-primary-foreground" /></div>
                  <div>
                    <div className="font-display font-bold tracking-tight">Investidor</div>
                    <div className="text-[10px] uppercase tracking-[0.28em] text-gold/90 font-semibold">Passivo · Premium</div>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)}><X className="size-5" /></button>
              </div>
              <nav className="flex-1 px-3 py-4 overflow-y-auto">
                {NAV_GROUPS.map((g, gi) => (
                  <div key={g.label} className={cn(gi > 0 && "mt-5")}>
                    <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/40 font-semibold">{g.label}</div>
                    {g.items.map((item) => {
                      const active = location.pathname === item.to;
                      const Icon = item.icon;
                      return (
                        <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                          className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                            active ? "bg-sidebar-accent text-primary-glow" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60")}>
                          <Icon className="size-[18px]" /><span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 sticky top-0 z-30 glass border-b border-border/60 flex items-center px-4 md:px-10 gap-4">
          <button className="md:hidden" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></button>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Bem-vindo de volta</div>
            <div className="text-base font-display font-semibold tracking-tight truncate">
              {settings.userName} <span className="text-muted-foreground font-normal">· {currentPageLabel(location.pathname)}</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full bg-muted/60 border border-border text-xs font-medium text-muted-foreground w-64">
            <Search className="size-3.5" />
            <span>Pesquisar ativos, metas...</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-[11px] font-semibold uppercase tracking-wider">
            <span className="size-1.5 rounded-full bg-success animate-pulse-glow" />
            Sincronizado
          </div>
          <button className="size-10 grid place-items-center rounded-xl border border-border bg-card hover:bg-accent transition-colors relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-gold" />
          </button>
          <button
            onClick={toggle}
            className="size-10 grid place-items-center rounded-xl border border-border bg-card hover:bg-accent transition-colors"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </header>
        <main className="flex-1 p-4 md:p-10 max-w-[1600px] w-full mx-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}

function currentPageLabel(p: string) {
  return ALL_NAV.find((n) => n.to === p)?.label ?? "Investidor Passivo";
}
