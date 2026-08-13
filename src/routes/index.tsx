import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, KeyRound, LockKeyhole, Layers, DatabaseZap, Sparkles, ArrowRight } from "lucide-react";
import type { Role } from "@/data/hms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HMS — Hostel Management System | Smart, Secure, Simplified" },
      { name: "description", content: "Role-based hostel management for students, admins and wardens: fees, complaints, rooms, outpass, attendance and mess — in one dashboard." },
      { property: "og:title", content: "HMS — Hostel Management System" },
      { property: "og:description", content: "Three role-based dashboards for students, admins and wardens. Fees, complaints, rooms, outpass, attendance and mess in one place." },
    ],
  }),
  component: Landing,
});

const roles: { id: Role; label: string; blurb: string; icon: typeof GraduationCap }[] = [
  { id: "student", label: "Student", blurb: "Fees, complaints, outpass, room, attendance & mess", icon: GraduationCap },
  { id: "admin", label: "Admin", blurb: "Students, rooms, fees collection, notices & reports", icon: ShieldCheck },
  { id: "warden", label: "Warden", blurb: "Approvals, attendance monitoring & student overview", icon: KeyRound },
];

const trust = [
  { icon: LockKeyhole, label: "Secure Access Control" },
  { icon: Layers, label: "Role-based Panels" },
  { icon: DatabaseZap, label: "Data Protection" },
  { icon: Sparkles, label: "Seamless Management" },
];

function Landing() {
  const [role, setRole] = useState<Role>("student");
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();

  return (
    <div data-role={role} className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: auth */}
        <div className="flex items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-role text-role-foreground">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold tracking-[0.2em] uppercase">HMS</p>
                <p className="text-xs text-muted-foreground">Smart · Secure · Simplified</p>
              </div>
            </div>

            <div className="panel p-6">
              <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
                {(["login", "register"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "rounded-lg py-2 text-sm font-medium capitalize transition-colors",
                      mode === m ? "bg-role text-role-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <p className="mb-2 text-sm text-muted-foreground">Login as</p>
              <div className="mb-6 grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors",
                      role === r.id ? "border-role bg-role-soft text-role" : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <r.icon className="size-4" />
                    {r.label}
                  </button>
                ))}
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void navigate({ to: role === "student" ? "/student" : role === "admin" ? "/admin" : "/warden" });
                }}
              >
                {mode === "register" ? (
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-muted-foreground">Full name</span>
                    <input required placeholder="Your name" className="h-11 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" />
                  </label>
                ) : null}
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted-foreground">Email</span>
                  <input type="email" defaultValue={`${role}@campus.edu`} className="h-11 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted-foreground">Password</span>
                  <input type="password" defaultValue="demo1234" className="h-11 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" />
                </label>
                <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-role text-sm font-semibold text-role-foreground transition-opacity hover:opacity-90">
                  {mode === "login" ? "Login" : "Create account"} as {roles.find((r) => r.id === role)?.label}
                  <ArrowRight className="size-4" />
                </button>
              </form>
              <p className="mt-4 text-center text-xs text-muted-foreground">Demo mode — any credentials open the selected panel.</p>
            </div>
          </div>
        </div>

        {/* Right: hero */}
        <div className="grid-glow relative flex flex-col justify-center border-t border-border bg-surface/40 px-6 py-14 sm:px-12 lg:border-t-0 lg:border-l">
          <h1 className="text-3xl leading-tight font-extrabold tracking-tight uppercase sm:text-4xl">
            Hostel Management<br />System
          </h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Students, rooms, fees, complaints, outpasses, attendance and mess — every part of hostel life
            centralised into three role-based dashboards.
          </p>

          <div className="mt-8 grid gap-3">
            {roles.map((r) => (
              <Link
                key={r.id}
                to={r.id === "student" ? "/student" : r.id === "admin" ? "/admin" : "/warden"}
                onMouseEnter={() => setRole(r.id)}
                className="panel group flex items-center gap-4 p-4 transition-shadow hover:shadow-glow"
              >
                <span className="role-chip flex size-11 shrink-0 items-center justify-center rounded-xl">
                  <r.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{r.label} Panel</p>
                  <p className="truncate text-xs text-muted-foreground">{r.blurb}</p>
                </div>
                <ArrowRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 border-t border-border pt-6 sm:grid-cols-4">
            {trust.map((t) => (
              <div key={t.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <t.icon className="size-4 text-role" />
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
