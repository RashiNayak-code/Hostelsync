import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Bell, Menu, X, LogOut, LayoutDashboard, Wallet, MessageSquareWarning, BedDouble,
  DoorOpen, UtensilsCrossed, CalendarCheck, PlaneTakeoff, UserRound, Settings,
  Users, Megaphone, FileBarChart2, ShieldCheck, GraduationCap, KeyRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/data/hms";
import { cn } from "@/lib/utils";

type NavItem = { label: string; to: string; icon: LucideIcon };
type AnyTo = "/";

const nav: Record<Role, NavItem[]> = {
  student: [
    { label: "Dashboard", to: "/student", icon: LayoutDashboard },
    { label: "Fees", to: "/student/fees", icon: Wallet },
    { label: "Complaints", to: "/student/complaints", icon: MessageSquareWarning },
    { label: "Room Allocation", to: "/student/room", icon: BedDouble },
    { label: "Outpass Request", to: "/student/outpass", icon: DoorOpen },
    { label: "Mess Timetable", to: "/student/mess", icon: UtensilsCrossed },
    { label: "Attendance", to: "/student/attendance", icon: CalendarCheck },
    { label: "Leave", to: "/student/leave", icon: PlaneTakeoff },
    { label: "Profile", to: "/student/profile", icon: UserRound },
    { label: "Settings", to: "/student/settings", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Students", to: "/admin/students", icon: Users },
    { label: "Rooms", to: "/admin/rooms", icon: BedDouble },
    { label: "Fees Management", to: "/admin/fees", icon: Wallet },
    { label: "Complaints", to: "/admin/complaints", icon: MessageSquareWarning },
    { label: "Outpass Requests", to: "/admin/outpass", icon: DoorOpen },
    { label: "Mess Timetable", to: "/admin/mess", icon: UtensilsCrossed },
    { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck },
    { label: "Leave Requests", to: "/admin/leave", icon: PlaneTakeoff },
    { label: "Notices", to: "/admin/notices", icon: Megaphone },
    { label: "Reports", to: "/admin/reports", icon: FileBarChart2 },
    { label: "Settings", to: "/admin/settings", icon: Settings },
  ],
  warden: [
    { label: "Dashboard", to: "/warden", icon: LayoutDashboard },
    { label: "Students", to: "/warden/students", icon: Users },
    { label: "Rooms", to: "/warden/rooms", icon: BedDouble },
    { label: "Complaints", to: "/warden/complaints", icon: MessageSquareWarning },
    { label: "Outpass Requests", to: "/warden/outpass", icon: DoorOpen },
    { label: "Attendance", to: "/warden/attendance", icon: CalendarCheck },
    { label: "Mess Timetable", to: "/warden/mess", icon: UtensilsCrossed },
    { label: "Leave Requests", to: "/warden/leave", icon: PlaneTakeoff },
    { label: "Notices", to: "/warden/notices", icon: Megaphone },
    { label: "Reports", to: "/warden/reports", icon: FileBarChart2 },
    { label: "Settings", to: "/warden/settings", icon: Settings },
  ],
};

const roleIcon: Record<Role, LucideIcon> = { student: GraduationCap, admin: ShieldCheck, warden: KeyRound };
const roleTitle: Record<Role, string> = { student: "Student Panel", admin: "Admin Panel", warden: "Warden Panel" };
const roleUser: Record<Role, { name: string; sub: string }> = {
  student: { name: "Aarav Sharma", sub: "HMS2024/CS/118" },
  admin: { name: "Priya Menon", sub: "Hostel Administrator" },
  warden: { name: "Sanjay Desai", sub: "Chief Warden · Block B" },
};

export function RoleLayout({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = nav[role];
  const RoleIcon = roleIcon[role];
  const user = roleUser[role];
  const active = items.filter((i) => pathname === i.to || pathname.startsWith(i.to + "/"));
  const current = (active.length ? active[active.length - 1] : items[0])!;

  return (
    <div data-role={role} className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface/80 backdrop-blur-xl transition-transform lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <span className="role-chip flex size-10 items-center justify-center rounded-xl">
              <RoleIcon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">HMS</p>
              <p className="text-xs text-role">{roleTitle[role]}</p>
            </div>
            <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {items.map((item) => {
              const isActive = item.to === current.to;
              return (
                <Link
                  key={item.to}
                  to={item.to as AnyTo}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-role text-role-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-3">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
            >
              <LogOut className="size-4" />
              Logout
            </Link>
          </div>
        </aside>

        {open ? (
          <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
        ) : null}

        <div className="min-w-0 flex-1 lg:pl-64">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <span className="role-chip hidden size-9 items-center justify-center rounded-lg sm:flex">
              <RoleIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{roleTitle[role]}</p>
              <p className="truncate text-xs text-muted-foreground">{current.label}</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button className="relative rounded-lg border border-border p-2 hover:bg-accent" aria-label="Notifications">
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-role" />
              </button>
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-role text-sm font-semibold text-role-foreground">
                  {user.name.charAt(0)}
                </span>
                <div className="hidden sm:block">
                  <p className="text-sm leading-tight font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.sub}</p>
                </div>
              </div>
            </div>
          </header>
          <main className="grid-glow min-h-[calc(100vh-61px)] p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
