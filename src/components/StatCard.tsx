import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: "primary" | "info" | "warning" | "success" | "gold";
  delay?: number;
  size?: "default" | "lg";
}

const ACCENTS = {
  primary: { glow: "from-primary/20 via-primary/5", text: "text-primary", ring: "ring-primary/20" },
  info: { glow: "from-info/20 via-info/5", text: "text-info", ring: "ring-info/20" },
  warning: { glow: "from-warning/20 via-warning/5", text: "text-warning", ring: "ring-warning/20" },
  success: { glow: "from-success/20 via-success/5", text: "text-success", ring: "ring-success/20" },
  gold: { glow: "from-gold/25 via-gold/5", text: "text-gold", ring: "ring-gold/20" },
};

export function StatCard({ label, value, hint, icon, accent = "primary", delay = 0, size = "default" }: StatCardProps) {
  const a = ACCENTS[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card shadow-soft hover:shadow-xl-soft transition-all duration-300",
        size === "lg" ? "p-7" : "p-6"
      )}
    >
      <div className={cn("absolute -top-20 -right-20 size-48 rounded-full bg-gradient-to-br to-transparent blur-2xl opacity-70 group-hover:opacity-100 transition-opacity", a.glow)} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("size-1.5 rounded-full", a.text.replace("text-", "bg-"))} />
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">{label}</div>
          </div>
          <div className={cn(
            "mt-3 font-display font-bold tracking-tight text-foreground tabular",
            size === "lg" ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"
          )}>{value}</div>
          {hint && <div className="mt-2 text-xs text-muted-foreground font-medium">{hint}</div>}
        </div>
        {icon && (
          <div className={cn(
            "size-11 rounded-xl grid place-items-center bg-background/80 border border-border ring-1 shadow-sm shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3",
            a.text, a.ring
          )}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function PanelCard({
  title, subtitle, children, action, className, padded = true,
}: { title?: string; subtitle?: string; children: ReactNode; action?: ReactNode; className?: string; padded?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden",
        padded && "p-6 md:p-7",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      {(title || action) && (
        <div className="flex items-start justify-between mb-5 gap-4">
          <div>
            {title && <h3 className="font-display font-semibold text-base md:text-lg tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}
