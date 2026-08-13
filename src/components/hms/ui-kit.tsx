import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const tone =
    ["active", "approved", "resolved", "paid", "present", "available"].includes(s)
      ? "bg-success/15 text-success border-success/30"
      : ["pending", "in progress", "leave", "maintenance"].includes(s)
        ? "bg-warning/15 text-warning border-warning/30"
        : ["rejected", "overdue", "absent", "inactive", "full"].includes(s)
          ? "bg-danger/15 text-danger border-danger/30"
          : "bg-muted text-muted-foreground border-border";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", tone)}>
      {status}
    </span>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("panel p-5", className)}>{children}</div>;
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint?: string }) {
  return (
    <div className="panel flex items-center gap-4 p-4">
      <span className="role-chip flex size-11 shrink-0 items-center justify-center rounded-xl">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="truncate text-xl font-semibold">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  to,
  cta,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  cta: string;
}) {
  return (
    <div className="panel flex flex-col gap-3 p-5 transition-shadow hover:shadow-glow">
      <div className="flex items-center gap-3">
        <span className="role-chip flex size-10 items-center justify-center rounded-xl">
          <Icon className="size-5" />
        </span>
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Link
        to={to as "/"}
        className="mt-auto inline-flex w-fit items-center justify-center rounded-lg bg-role px-3.5 py-2 text-sm font-medium text-role-foreground transition-opacity hover:opacity-90"
      >
        {cta}
      </Link>
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-role" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
