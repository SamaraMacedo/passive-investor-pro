import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: "primary" | "info" | "warning" | "success";
  delay?: number;
}

const ACCENTS = {
  primary: "from-primary/15 to-primary/0 text-primary",
  info: "from-info/15 to-info/0 text-info",
  warning: "from-warning/15 to-warning/0 text-warning",
  success: "from-success/15 to-success/0 text-success",
};

export function StatCard({ label, value, hint, icon, accent = "primary", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-soft hover:shadow-elegant transition-shadow p-5"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", ACCENTS[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
          <div className="mt-2 text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {icon && (
          <div className={cn("size-10 rounded-xl grid place-items-center bg-background/60 border border-border", ACCENTS[accent])}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function PanelCard({
  title, subtitle, children, action, className,
}: { title?: string; subtitle?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-soft p-5 md:p-6", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            {title && <h3 className="font-display font-semibold text-base md:text-lg">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
