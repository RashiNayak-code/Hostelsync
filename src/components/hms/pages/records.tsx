import { DataTable, type Column } from "@/components/hms/DataTable";
import { DonutProgress } from "@/components/hms/DonutProgress";
import { PageHeader, Panel, StatCard, StatusBadge, ProgressBar } from "@/components/hms/ui-kit";
import {
  attendance, complaints, currentStudent, fees, feeCollection, inr, leaves, outpasses,
  rooms, students, roommates, type Role,
} from "@/data/hms";
import { BedDouble, CheckCircle2, Clock, DoorOpen, IndianRupee, Users, XCircle } from "lucide-react";

const isStudent = (r: Role) => r === "student";
const btn = "inline-flex items-center rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent";
const btnRole = "inline-flex items-center rounded-lg bg-role px-3 py-2 text-sm font-medium text-role-foreground hover:opacity-90";

function ActionCell({ labels }: { labels: string[] }) {
  return (
    <div className="flex gap-2">
      {labels.map((l) => (
        <button key={l} className={btn}>{l}</button>
      ))}
    </div>
  );
}

/* ---------------- Fees ---------------- */
export function FeesPage({ role }: { role: Role }) {
  const rows = isStudent(role) ? fees.filter((f) => f.student === currentStudent.name) : fees;
  const cols: Column<(typeof fees)[number]>[] = [
    { key: "id", header: "Invoice", render: (r) => <span className="font-medium">{r.id}</span> },
    ...(isStudent(role) ? [] : [{ key: "student", header: "Student", render: (r: (typeof fees)[number]) => (
      <div><p className="font-medium">{r.student}</p><p className="text-xs text-muted-foreground">{r.rollNo}</p></div>
    ) }]),
    { key: "semester", header: "Semester", render: (r) => r.semester },
    { key: "amount", header: "Amount", render: (r) => inr(r.amount) },
    { key: "paid", header: "Paid", render: (r) => <div className="w-28"><p className="mb-1 text-xs">{inr(r.paid)}</p><ProgressBar value={(r.paid / r.amount) * 100} /></div> },
    { key: "dueDate", header: "Due date", render: (r) => r.dueDate },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "action", header: "", render: () => <ActionCell labels={isStudent(role) ? ["Pay now"] : ["Mark paid", "Remind"]} /> },
  ];
  const due = rows.reduce((a, f) => a + (f.amount - f.paid), 0);
  const paid = rows.reduce((a, f) => a + f.paid, 0);

  return (
    <>
      <PageHeader
        title={isStudent(role) ? "My Fees" : "Fees Management"}
        description={isStudent(role) ? "Track your hostel and mess payments." : "All fee records, collection status and dues."}
        action={<button className={btnRole}>{isStudent(role) ? "Download receipts" : "Export ledger"}</button>}
      />
      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <StatCard icon={IndianRupee} label="Paid" value={inr(paid)} />
        <StatCard icon={Clock} label="Outstanding" value={inr(due)} />
        <StatCard icon={CheckCircle2} label="Cleared invoices" value={String(rows.filter((r) => r.status === "Paid").length)} />
        <Panel className="flex items-center justify-center py-2">
          <DonutProgress value={feeCollection.collectedPct} label={isStudent(role) ? "of your dues cleared" : "collected"} />
        </Panel>
      </div>
      <DataTable title="Fee records" rows={rows} columns={cols} searchKeys={["student", "id", "semester", "status"]} />
    </>
  );
}

/* ---------------- Complaints ---------------- */
export function ComplaintsPage({ role }: { role: Role }) {
  const rows = isStudent(role) ? complaints.filter((c) => c.student === currentStudent.name) : complaints;
  const cols: Column<(typeof complaints)[number]>[] = [
    { key: "id", header: "Ticket", render: (r) => <span className="font-medium">{r.id}</span> },
    ...(isStudent(role) ? [] : [{ key: "student", header: "Student", render: (r: (typeof complaints)[number]) => (
      <div><p className="font-medium">{r.student}</p><p className="text-xs text-muted-foreground">Room {r.roomNo}</p></div>
    ) }]),
    { key: "category", header: "Category", render: (r) => r.category },
    { key: "description", header: "Description", render: (r) => <p className="max-w-sm text-muted-foreground">{r.description}</p> },
    { key: "raisedAt", header: "Raised", render: (r) => r.raisedAt },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "action", header: "", render: () => <ActionCell labels={isStudent(role) ? ["View"] : ["In progress", "Resolve"]} /> },
  ];
  return (
    <>
      <PageHeader
        title={isStudent(role) ? "My Complaints" : "Complaints"}
        description={isStudent(role) ? "Raise an issue and track it until it is resolved." : "Every reported issue across the hostel."}
        action={<button className={btnRole}>{isStudent(role) ? "Raise complaint" : "Export list"}</button>}
      />
      {isStudent(role) ? (
        <Panel className="mb-6">
          <h2 className="mb-4 text-base font-semibold">New complaint</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Category</span>
              <select className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role">
                {["Water", "Electricity", "Mess", "WiFi", "Furniture", "Other"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Room no.</span>
              <input defaultValue={currentStudent.roomNo} className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" />
            </label>
            <label className="text-sm md:col-span-1">
              <span className="mb-1.5 block text-muted-foreground">Priority</span>
              <select className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role">
                <option>Normal</option><option>Urgent</option>
              </select>
            </label>
            <label className="text-sm md:col-span-3">
              <span className="mb-1.5 block text-muted-foreground">Description</span>
              <textarea rows={3} placeholder="Describe the issue…" className="w-full rounded-lg border border-input bg-background/60 p-3 text-sm outline-none focus:border-role" />
            </label>
          </div>
          <button className={btnRole + " mt-4"}>Submit complaint</button>
        </Panel>
      ) : null}
      <DataTable title="Complaint tickets" rows={rows} columns={cols} searchKeys={["student", "category", "status", "id"]} />
    </>
  );
}

/* ---------------- Outpass ---------------- */
export function OutpassPage({ role }: { role: Role }) {
  const rows = isStudent(role) ? outpasses.filter((o) => o.student === currentStudent.name) : outpasses;
  const cols: Column<(typeof outpasses)[number]>[] = [
    { key: "id", header: "Request", render: (r) => <span className="font-medium">{r.id}</span> },
    ...(isStudent(role) ? [] : [{ key: "student", header: "Student", render: (r: (typeof outpasses)[number]) => (
      <div><p className="font-medium">{r.student}</p><p className="text-xs text-muted-foreground">{r.rollNo}</p></div>
    ) }]),
    { key: "reason", header: "Reason", render: (r) => r.reason },
    { key: "departure", header: "Departure", render: (r) => r.departure },
    { key: "expectedReturn", header: "Expected return", render: (r) => r.expectedReturn },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "action", header: "", render: () => <ActionCell labels={isStudent(role) ? ["Cancel"] : ["Approve", "Reject"]} /> },
  ];
  return (
    <>
      <PageHeader
        title={isStudent(role) ? "Outpass Request" : "Outpass Requests"}
        description={isStudent(role) ? "Apply for a short exit and track approval." : "Approve or reject student exit requests."}
        action={!isStudent(role) ? <button className={btnRole}>Export log</button> : undefined}
      />
      {isStudent(role) ? (
        <Panel className="mb-6">
          <h2 className="mb-4 text-base font-semibold">New outpass</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">Departure</span>
              <input type="datetime-local" className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" /></label>
            <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">Expected return</span>
              <input type="datetime-local" className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" /></label>
            <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">Reason</span>
              <input placeholder="Reason for exit" className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" /></label>
          </div>
          <button className={btnRole + " mt-4"}>Submit request</button>
        </Panel>
      ) : null}
      <DataTable title="Outpass history" rows={rows} columns={cols} searchKeys={["student", "reason", "status", "id"]} />
    </>
  );
}

/* ---------------- Leave ---------------- */
export function LeavePage({ role }: { role: Role }) {
  const rows = isStudent(role) ? leaves.filter((l) => l.student === currentStudent.name) : leaves;
  const cols: Column<(typeof leaves)[number]>[] = [
    { key: "id", header: "Request", render: (r) => <span className="font-medium">{r.id}</span> },
    ...(isStudent(role) ? [] : [{ key: "student", header: "Student", render: (r: (typeof leaves)[number]) => r.student }]),
    { key: "from", header: "From", render: (r) => r.from },
    { key: "to", header: "To", render: (r) => r.to },
    { key: "reason", header: "Reason", render: (r) => r.reason },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "action", header: "", render: () => <ActionCell labels={isStudent(role) ? ["Withdraw"] : ["Approve", "Reject"]} /> },
  ];
  return (
    <>
      <PageHeader
        title={isStudent(role) ? "Leave" : "Leave Requests"}
        description={isStudent(role) ? "Apply for multi-day leave from the hostel." : "Review long-duration leave applications."}
      />
      {isStudent(role) ? (
        <Panel className="mb-6">
          <h2 className="mb-4 text-base font-semibold">Apply for leave</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">From</span>
              <input type="date" className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" /></label>
            <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">To</span>
              <input type="date" className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" /></label>
            <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">Reason</span>
              <input placeholder="Reason for leave" className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role" /></label>
          </div>
          <button className={btnRole + " mt-4"}>Submit application</button>
        </Panel>
      ) : null}
      <DataTable title="Leave applications" rows={rows} columns={cols} searchKeys={["student", "reason", "status", "id"]} />
    </>
  );
}

/* ---------------- Attendance ---------------- */
export function AttendancePage({ role }: { role: Role }) {
  const rows = isStudent(role) ? attendance.filter((a) => a.student === currentStudent.name) : attendance;
  const cols: Column<(typeof attendance)[number]>[] = [
    { key: "date", header: "Date", render: (r) => <span className="font-medium">{r.date}</span> },
    ...(isStudent(role) ? [] : [{ key: "student", header: "Student", render: (r: (typeof attendance)[number]) => (
      <div><p className="font-medium">{r.student}</p><p className="text-xs text-muted-foreground">Room {r.roomNo}</p></div>
    ) }]),
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "markedBy", header: "Marked by", render: (r) => r.markedBy },
    ...(isStudent(role) ? [] : [{ key: "action", header: "", render: () => <ActionCell labels={["Present", "Absent", "Leave"]} /> }]),
  ];
  const present = rows.filter((r) => r.status === "Present").length;
  return (
    <>
      <PageHeader
        title={isStudent(role) ? "My Attendance" : "Attendance"}
        description={isStudent(role) ? "Your daily hostel attendance record." : "Mark and monitor daily room attendance."}
        action={!isStudent(role) ? <button className={btnRole}>Mark today (bulk)</button> : undefined}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={CheckCircle2} label="Present days" value={String(present)} />
        <StatCard icon={XCircle} label="Absent days" value={String(rows.filter((r) => r.status === "Absent").length)} />
        <StatCard icon={Clock} label="Attendance rate" value={rows.length ? Math.round((present / rows.length) * 100) + "%" : "—"} />
      </div>
      <DataTable title="Attendance log" rows={rows} columns={cols} searchKeys={["student", "date", "status"]} />
    </>
  );
}

/* ---------------- Students ---------------- */
export function StudentsPage({ role }: { role: Role }) {
  const readOnly = role === "warden";
  const cols: Column<(typeof students)[number]>[] = [
    { key: "name", header: "Student", render: (r) => (
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-role/20 text-sm font-semibold text-role">{r.name.charAt(0)}</span>
        <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.rollNo}</p></div>
      </div>
    ) },
    { key: "course", header: "Course", render: (r) => <div><p>{r.course}</p><p className="text-xs text-muted-foreground">{r.year}</p></div> },
    { key: "roomNo", header: "Room", render: (r) => r.roomNo },
    { key: "phone", header: "Phone", render: (r) => r.phone },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "action", header: "", render: () => <ActionCell labels={readOnly ? ["View"] : ["Edit", "Remove"]} /> },
  ];
  return (
    <>
      <PageHeader
        title="Students"
        description={readOnly ? "Read-only overview of all hostel residents." : "Full resident directory with search and management."}
        action={!readOnly ? <button className={btnRole}>Add student</button> : undefined}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Total students" value={String(students.length * 32)} hint="Across all blocks" />
        <StatCard icon={CheckCircle2} label="Active" value={String(students.filter((s) => s.status === "Active").length * 32)} />
        <StatCard icon={DoorOpen} label="On outpass today" value="12" />
      </div>
      <DataTable title="Students overview" rows={students} columns={cols} searchKeys={["name", "rollNo", "course", "roomNo"]} />
    </>
  );
}

/* ---------------- Rooms ---------------- */
export function RoomsPage({ role }: { role: Role }) {
  const readOnly = role === "warden";
  const cols: Column<(typeof rooms)[number]>[] = [
    { key: "roomNo", header: "Room", render: (r) => <span className="font-medium">{r.roomNo}</span> },
    { key: "block", header: "Block", render: (r) => <div><p>{r.block}</p><p className="text-xs text-muted-foreground">{r.floor} floor</p></div> },
    { key: "occupancy", header: "Occupancy", render: (r) => (
      <div className="w-32"><p className="mb-1 text-xs">{r.occupied}/{r.capacity} beds</p><ProgressBar value={(r.occupied / r.capacity) * 100} /></div>
    ) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "action", header: "", render: () => <ActionCell labels={readOnly ? ["View"] : ["Allocate", "Edit"]} /> },
  ];
  const beds = rooms.reduce((a, r) => a + r.capacity, 0);
  const used = rooms.reduce((a, r) => a + r.occupied, 0);
  return (
    <>
      <PageHeader
        title="Rooms"
        description={readOnly ? "Block-wise room occupancy." : "Add rooms, edit details and allocate beds."}
        action={!readOnly ? <button className={btnRole}>Add room</button> : undefined}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={BedDouble} label="Total rooms" value={String(rooms.length * 18)} />
        <StatCard icon={Users} label="Occupancy" value={Math.round((used / beds) * 100) + "%"} hint={`${used}/${beds} sample beds`} />
        <StatCard icon={Clock} label="Under maintenance" value={String(rooms.filter((r) => r.status === "Maintenance").length)} />
      </div>
      <DataTable title="Room inventory" rows={rooms} columns={cols} searchKeys={["roomNo", "block", "status"]} />
    </>
  );
}

/* ---------------- Student room allocation ---------------- */
export function MyRoomPage() {
  return (
    <>
      <PageHeader title="Room Allocation" description="Your allotted room and roommates." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Allotted room</p>
          <p className="mt-2 text-4xl font-bold text-role">{currentStudent.roomNo}</p>
          <dl className="mt-5 space-y-3 text-sm">
            {[["Block", currentStudent.block], ["Floor", currentStudent.floor], ["Capacity", "3 beds"], ["Allotted on", currentStudent.dateOfJoining]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <button className={btnRole + " mt-5 w-full justify-center"}>Request room change</button>
        </Panel>
        <Panel className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Roommates</h2>
          <div className="space-y-3">
            {roommates.map((m) => (
              <div key={m.rollNo} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-role/20 font-semibold text-role">{m.name.charAt(0)}</span>
                <div className="min-w-0">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.rollNo} · {m.course}</p>
                </div>
                <span className="ml-auto text-sm text-muted-foreground">{m.phone}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-border bg-role-soft p-4 text-sm">
            <p className="font-medium">Room rules</p>
            <p className="mt-1 text-muted-foreground">Lights out by 11:30 PM · No cooking appliances · Report damages within 24 hours.</p>
          </div>
        </Panel>
      </div>
    </>
  );
}
