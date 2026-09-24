import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  GraduationCap,
  ShieldCheck,
  KeyRound,
  LockKeyhole,
  Layers,
  DatabaseZap,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { Role } from "@/data/hms";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HMS — Hostel Management System | Smart, Secure, Simplified" },
      {
        name: "description",
        content:
          "Role-based hostel management for students, admins and wardens: fees, complaints, rooms, outpass, attendance and mess — in one dashboard.",
      },
      { property: "og:title", content: "HMS — Hostel Management System" },
      {
        property: "og:description",
        content:
          "Three role-based dashboards for students, admins and wardens. Fees, complaints, rooms, outpass, attendance and mess in one place.",
      },
    ],
  }),
  component: Landing,
});

const roles: { id: Role; label: string; blurb: string; icon: typeof GraduationCap }[] = [
  {
    id: "student",
    label: "Student",
    blurb: "Fees, complaints, outpass, room, attendance & mess",
    icon: GraduationCap,
  },
  {
    id: "admin",
    label: "Admin",
    blurb: "Students, rooms, fees collection, notices & reports",
    icon: ShieldCheck,
  },
  {
    id: "warden",
    label: "Warden",
    blurb: "Approvals, attendance monitoring & student overview",
    icon: KeyRound,
  },
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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("student@campus.edu");
  const [password, setPassword] = useState("demo1234");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const redirectToRolePanel = (targetRole: Role) => {
    const route =
      targetRole === "student" ? "/student" : targetRole === "admin" ? "/admin" : "/warden";
    void navigate({ to: route });
  };

  const getDatabaseRole = async (userId: string, fallbackRole: Role) => {
    const { data: profile, error } = await getSupabaseClient()
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn(
        "Unable to load HMS profile; using the authenticated user's role:",
        error.message,
      );
      return fallbackRole;
    }

    return profile?.role === "admin" || profile?.role === "warden" || profile?.role === "student"
      ? profile.role
      : fallbackRole;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();

      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              full_name: fullName.trim() || email.split("@")[0],
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          const databaseRole = await getDatabaseRole(data.user.id, role);
          redirectToRolePanel(databaseRole);
          return;
        }

        setSuccessMessage("Account created. Check your email to confirm before signing in.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Supabase did not return a user after login.");
      }

      const metadataRole = data.user.user_metadata?.role;
      const fallbackRole =
        metadataRole === "admin" || metadataRole === "warden" || metadataRole === "student"
          ? metadataRole
          : "student";
      const databaseRole = await getDatabaseRole(data.user.id, fallbackRole);
      redirectToRolePanel(databaseRole);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      setErrorMessage(
        message.toLowerCase().includes("email not confirmed")
          ? "This email is registered but not confirmed. Check your inbox or disable email confirmation in Supabase for development."
          : message.toLowerCase().includes("invalid login credentials")
            ? "The email or password is incorrect. Use the password saved for this Supabase user."
            : message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
                      mode === m
                        ? "bg-role text-role-foreground"
                        : "text-muted-foreground hover:text-foreground",
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
                      role === r.id
                        ? "border-role bg-role-soft text-role"
                        : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <r.icon className="size-4" />
                    {r.label}
                  </button>
                ))}
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {mode === "register" ? (
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-muted-foreground">Full name</span>
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="h-11 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
                    />
                  </label>
                ) : null}
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted-foreground">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted-foreground">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
                  />
                </label>

                {errorMessage ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {errorMessage}
                  </p>
                ) : null}

                {successMessage ? (
                  <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    {successMessage}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-role text-sm font-semibold text-role-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}{" "}
                  as {roles.find((r) => r.id === role)?.label}
                  <ArrowRight className="size-4" />
                </button>
              </form>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Use your Supabase email/password to sign in or register.
              </p>
            </div>
          </div>
        </div>

        {/* Right: hero */}
        <div className="grid-glow relative flex flex-col justify-center border-t border-border bg-surface/40 px-6 py-14 sm:px-12 lg:border-t-0 lg:border-l">
          <h1 className="text-3xl leading-tight font-extrabold tracking-tight uppercase sm:text-4xl">
            Hostel Management
            <br />
            System
          </h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Students, rooms, fees, complaints, outpasses, attendance and mess — every part of hostel
            life centralised into three role-based dashboards.
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
