import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DonutProgress } from "@/components/hms/DonutProgress";
import { FeatureCard, PageHeader, Panel, StatCard, StatusBadge } from "@/components/hms/ui-kit";
import { useHmsDashboardData } from "@/hooks/use-hms-dashboard-data";
import { getSupabaseClient } from "@/lib/supabase";
import {
  attendanceTrend,
  complaints,
  currentStudent,
  feeCollection,
  fees,
  inr,
  leaves,
  notices,
  outpasses,
  rooms,
  students,
} from "@/data/hms";
import {
  Wallet,
  MessageSquareWarning,
  BedDouble,
  DoorOpen,
  UtensilsCrossed,
  CalendarCheck,
  PlaneTakeoff,
  Users,
  Megaphone,
  FileBarChart2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function RecentActivity() {
  const items = [
    { text: "Outpass OP-884 raised by Meera Nair", time: "18m ago" },
    { text: "Complaint CMP-3129 marked In Progress", time: "1h ago" },
    { text: "Fee payment received — FEE-1045", time: "3h ago" },
    { text: "Notice published: Water supply maintenance", time: "Yesterday" },
  ];
  return (
    <Panel>
      <h2 className="mb-4 text-base font-semibold">Recent activity</h2>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.text} className="flex items-start gap-3 text-sm">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-role" />
            <span className="flex-1">{i.text}</span>
            <span className="text-xs whitespace-nowrap text-muted-foreground">{i.time}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function AttendanceChart({ data = attendanceTrend }: { data?: typeof attendanceTrend }) {
  return (
    <Panel>
      <h2 className="mb-4 text-base font-semibold">Attendance this week</h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--role)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="var(--role)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "var(--popover-foreground)",
              }}
            />
            <Area
              type="monotone"
              dataKey="present"
              stroke="var(--role)"
              strokeWidth={2}
              fill="url(#att)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function useSessionStudentProfile() {
  const [profile, setProfile] = useState({
    userId: undefined as string | undefined,
    name: currentStudent.name,
    course: currentStudent.course,
    roomNo: currentStudent.roomNo,
    block: currentStudent.block,
    floor: currentStudent.floor,
  });

  useEffect(() => {
    const supabase = getSupabaseClient();
    let isMounted = true;

    const sync = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user || !isMounted) {
        return;
      }

      const userMeta = session.user.user_metadata ?? {};
      const nextProfile = {
        userId: session.user.id,
        name:
          (typeof userMeta.full_name === "string" && userMeta.full_name.trim()) ||
          session.user.email?.split("@")[0] ||
          currentStudent.name,
        course:
          (typeof userMeta.course === "string" && userMeta.course.trim()) || currentStudent.course,
        roomNo:
          (typeof userMeta.room_no === "string" && userMeta.room_no.trim()) ||
          currentStudent.roomNo,
        block:
          (typeof userMeta.block === "string" && userMeta.block.trim()) || currentStudent.block,
        floor:
          (typeof userMeta.floor === "string" && userMeta.floor.trim()) || currentStudent.floor,
      };

      if (isMounted) {
        setProfile(nextProfile);
      }
    };

    void sync();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!nextSession?.user) {
        return;
      }

      const userMeta = nextSession.user.user_metadata ?? {};
      const nextProfile = {
        userId: nextSession.user.id,
        name:
          (typeof userMeta.full_name === "string" && userMeta.full_name.trim()) ||
          nextSession.user.email?.split("@")[0] ||
          currentStudent.name,
        course:
          (typeof userMeta.course === "string" && userMeta.course.trim()) || currentStudent.course,
        roomNo:
          (typeof userMeta.room_no === "string" && userMeta.room_no.trim()) ||
          currentStudent.roomNo,
        block:
          (typeof userMeta.block === "string" && userMeta.block.trim()) || currentStudent.block,
        floor:
          (typeof userMeta.floor === "string" && userMeta.floor.trim()) || currentStudent.floor,
      };

      if (isMounted) {
        setProfile(nextProfile);
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return profile;
}

export function StudentDashboard() {
  const profile = useSessionStudentProfile();
  const liveData = useHmsDashboardData(profile.userId);
  const myFees = liveData.fees.filter((f) => f.student === profile.name);
  const pending = myFees.reduce((a, f) => a + (f.amount - f.paid), 0);
  const myComplaints = liveData.complaints.filter((c) => c.student === profile.name);
  return (
    <>
      <PageHeader
        title={`Welcome back, ${profile.name.split(" ")[0]}`}
        description={`${profile.course} · Room ${profile.roomNo}`}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Pending dues"
          value={inr(pending)}
          hint="Mess fee · due 05 Sep"
        />
        <StatCard
          icon={BedDouble}
          label="Room"
          value={profile.roomNo}
          hint={`${profile.block} · ${profile.floor}`}
        />
        <StatCard icon={CalendarCheck} label="Attendance" value="94%" hint="This semester" />
        <StatCard icon={DoorOpen} label="Open requests" value="2" hint="1 outpass · 1 leave" />
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FeatureCard
          icon={Wallet}
          title="Fees"
          description="View invoices, payment history and pay pending dues."
          to="/student/fees"
          cta="View Fees"
        />
        <FeatureCard
          icon={MessageSquareWarning}
          title="Complaints"
          description="Raise a maintenance issue and track its resolution."
          to="/student/complaints"
          cta="Go to Complaints"
        />
        <FeatureCard
          icon={DoorOpen}
          title="Outpass"
          description="Apply for a short exit and check approval status."
          to="/student/outpass"
          cta="New Request"
        />
        <FeatureCard
          icon={UtensilsCrossed}
          title="Mess Timetable"
          description="This week's menu and meal timings."
          to="/student/mess"
          cta="View Menu"
        />
        <FeatureCard
          icon={PlaneTakeoff}
          title="Leave"
          description="Apply for multi-day leave from the hostel."
          to="/student/leave"
          cta="Apply Leave"
        />
        <FeatureCard
          icon={BedDouble}
          title="Room Allocation"
          description="Your room details and roommates."
          to="/student/room"
          cta="View Room"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel>
          <h2 className="mb-2 text-base font-semibold">Fees cleared</h2>
          <DonutProgress
            value={Math.round(
              (myFees.reduce((a, f) => a + f.paid, 0) / myFees.reduce((a, f) => a + f.amount, 0)) *
                100,
            )}
            label="of this semester"
          />
        </Panel>
        <Panel className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">My recent complaints</h2>
          <div className="space-y-3">
            {myComplaints.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {c.category} · {c.id}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{c.description}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
          <Link
            to="/student/complaints"
            className="mt-4 inline-block text-sm font-medium text-role hover:underline"
          >
            View all complaints →
          </Link>
        </Panel>
        <Panel className="lg:col-span-3">
          <h2 className="mb-4 text-base font-semibold">Notices for you</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {liveData.notices.slice(0, 4).map((n) => (
              <div key={n.id} className="rounded-xl border border-border p-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

export function AdminDashboard() {
  const liveData = useHmsDashboardData(undefined, true);
  const collected = liveData.fees.reduce((total, fee) => total + fee.paid, 0);
  const target = liveData.fees.reduce((total, fee) => total + fee.amount, 0);
  const collectedPct = target ? Math.round((collected / target) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Everything happening across the hostel today."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total students"
          value={String(liveData.students.length)}
          hint="Across all blocks"
        />
        <StatCard
          icon={BedDouble}
          label="Total rooms"
          value={String(liveData.rooms.length)}
          hint={`${liveData.rooms.filter((r) => r.status === "Available").length} rooms available`}
        />
        <StatCard
          icon={MessageSquareWarning}
          label="Open complaints"
          value={String(liveData.complaints.filter((c) => c.status !== "Resolved").length)}
        />
        <StatCard
          icon={Wallet}
          label="Fees collected"
          value={inr(collected)}
          hint={`${collectedPct}% of target`}
        />
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Panel>
          <h2 className="mb-2 text-base font-semibold">Fee collection</h2>
          <DonutProgress value={collectedPct} label="collected" />
        </Panel>
        <div className="lg:col-span-2">
          <AttendanceChart data={liveData.attendance} />
        </div>
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FeatureCard
          icon={Users}
          title="Students"
          description="Add, edit and search the full resident directory."
          to="/admin/students"
          cta="Manage Students"
        />
        <FeatureCard
          icon={Wallet}
          title="Fees Management"
          description="Track dues, mark payments and export ledgers."
          to="/admin/fees"
          cta="Open Fees"
        />
        <FeatureCard
          icon={DoorOpen}
          title="Outpass Requests"
          description="Approve or reject pending exit requests."
          to="/admin/outpass"
          cta="Review Requests"
        />
        <FeatureCard
          icon={Megaphone}
          title="Notices"
          description="Publish announcements to students and wardens."
          to="/admin/notices"
          cta="Post Notice"
        />
        <FeatureCard
          icon={BedDouble}
          title="Rooms"
          description="Room inventory, allocation and maintenance."
          to="/admin/rooms"
          cta="Manage Rooms"
        />
        <FeatureCard
          icon={FileBarChart2}
          title="Reports"
          description="Collections, attendance and complaint analytics."
          to="/admin/reports"
          cta="View Reports"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <Panel>
          <h2 className="mb-4 text-base font-semibold">Pending approvals</h2>
          <div className="space-y-3">
            {liveData.outpasses
              .filter((o) => o.status === "Pending")
              .map((o) => (
                <div
                  key={o.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{o.student}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.reason} · {o.departure}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))}
            {liveData.leaves
              .filter((l) => l.status === "Pending")
              .map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{l.student} · Leave</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.from} → {l.to}
                    </p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

export function WardenDashboard() {
  const liveData = useHmsDashboardData(undefined, true);

  return (
    <>
      <PageHeader
        title="Warden Dashboard"
        description="Block B · today's student activity at a glance."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Students in block"
          value={String(liveData.students.length)}
          hint="Residents in assigned blocks"
        />
        <StatCard
          icon={DoorOpen}
          label="Active outpasses"
          value={String(liveData.outpasses.filter((o) => o.status === "Approved").length)}
        />
        <StatCard
          icon={Clock}
          label="Pending complaints"
          value={String(liveData.complaints.filter((c) => c.status === "Pending").length)}
        />
        <StatCard
          icon={CheckCircle2}
          label="Attendance today"
          value="93%"
          hint="Marked at 10:30 PM"
        />
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FeatureCard
          icon={DoorOpen}
          title="Outpass Requests"
          description="Approve or reject student exit requests."
          to="/warden/outpass"
          cta="Review Requests"
        />
        <FeatureCard
          icon={MessageSquareWarning}
          title="Complaints"
          description="Update status on issues reported in your blocks."
          to="/warden/complaints"
          cta="Go to Complaints"
        />
        <FeatureCard
          icon={CalendarCheck}
          title="Attendance"
          description="Mark and monitor daily room attendance."
          to="/warden/attendance"
          cta="Mark Attendance"
        />
        <FeatureCard
          icon={PlaneTakeoff}
          title="Leave Requests"
          description="Review multi-day leave applications."
          to="/warden/leave"
          cta="Review Leave"
        />
        <FeatureCard
          icon={Users}
          title="Students"
          description="Read-only overview of residents and rooms."
          to="/warden/students"
          cta="View Students"
        />
        <FeatureCard
          icon={UtensilsCrossed}
          title="Mess Timetable"
          description="This week's menu and meal timings."
          to="/warden/mess"
          cta="View Menu"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceChart data={liveData.attendance} />
        </div>
        <RecentActivity />
      </div>
    </>
  );
}
