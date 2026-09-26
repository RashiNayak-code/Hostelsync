import { useCallback, useEffect, useRef, useState } from "react";
import { DataTable, type Column } from "@/components/hms/DataTable";
import { DonutProgress } from "@/components/hms/DonutProgress";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { PageHeader, Panel, StatCard, StatusBadge, ProgressBar } from "@/components/hms/ui-kit";
import { getSupabaseClient } from "@/lib/supabase";
import {
  attendance,
  complaints,
  currentStudent,
  fees,
  feeCollection,
  inr,
  leaves,
  outpasses,
  rooms,
  students,
  roommates,
  type Complaint,
  type Fee,
  type ParentNotification,
  type Role,
} from "@/data/hms";
import {
  AlertCircle,
  BedDouble,
  CheckCircle2,
  Clock,
  DoorOpen,
  IndianRupee,
  Loader2,
  Users,
  XCircle,
} from "lucide-react";

const isStudent = (r: Role) => r === "student";
const btn =
  "inline-flex items-center rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent";
const btnRole =
  "inline-flex items-center rounded-lg bg-role px-3 py-2 text-sm font-medium text-role-foreground hover:opacity-90";

const formatCsvValue = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

const splitOutpassDateTime = (value: string) => {
  const [date = "", time = ""] = value.split(",");
  return { date: date.trim(), time: time.trim() };
};

const downloadFeesCsv = (rows: (typeof fees)[number][], filename: string) => {
  const headers = [
    "Invoice",
    "Student",
    "Roll No",
    "Semester",
    "Amount",
    "Paid",
    "Due Date",
    "Status",
  ];
  const csvLines = [headers.join(",")];

  rows.forEach((row) => {
    csvLines.push(
      [row.id, row.student, row.rollNo, row.semester, row.amount, row.paid, row.dueDate, row.status]
        .map(formatCsvValue)
        .join(","),
    );
  });

  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

function ActionCell({ labels }: { labels: string[] }) {
  return (
    <div className="flex gap-2">
      {labels.map((l) => (
        <button key={l} className={btn}>
          {l}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Fees ---------------- */
const formatDueDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
};

export function FeesPage({ role }: { role: Role }) {
  const [feeRows, setFeeRows] = usePersistentState("hotelsync-fees", fees);
  const [remindedFees, setRemindedFees] = useState<string[]>([]);
  const [studentFees, setStudentFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(isStudent(role));
  const [error, setError] = useState<string | null>(null);

  const fetchStudentFees = useCallback(async () => {
    if (!isStudent(role)) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const userId = session?.user?.id;
      if (!userId) {
        setStudentFees([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("fees")
        .select("*")
        .eq("user_id", userId)
        .order("due_date");

      if (fetchError) {
        throw fetchError;
      }

      const mapped: Fee[] = (data || []).map((row) => {
        const amount = Number(row.amount ?? 0);
        const paid = Number(row.paid ?? 0);
        const rawDueDate = (row.due_date as string | null) ?? "";
        const isOverdue = rawDueDate
          ? new Date(rawDueDate + "T23:59:59").getTime() < Date.now()
          : false;
        const status: Fee["status"] =
          paid >= amount && amount > 0 ? "Paid" : isOverdue ? "Overdue" : "Pending";

        return {
          id: row.id,
          student: row.student_name ?? "",
          rollNo: row.roll_no ?? "",
          semester: row.semester ?? "",
          amount,
          paid,
          dueDate: formatDueDate(rawDueDate),
          status,
          method: row.method ?? undefined,
        };
      });

      setStudentFees(mapped);
    } catch (err: unknown) {
      console.error("Error fetching student fees:", err);
      setError(err instanceof Error ? err.message : "Failed to load fee records.");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (!isStudent(role)) return;

    void fetchStudentFees();

    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void fetchStudentFees();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchStudentFees, role]);

  const rows: Fee[] = isStudent(role) ? studentFees : feeRows;
  const cols: Column<Fee>[] = [
    { key: "id", header: "Invoice", render: (r) => <span className="font-medium">{r.id}</span> },
    ...(isStudent(role)
      ? []
      : [
          {
            key: "student",
            header: "Student",
            render: (r: Fee) => (
              <div>
                <p className="font-medium">{r.student}</p>
                <p className="text-xs text-muted-foreground">{r.rollNo}</p>
              </div>
            ),
          },
        ]),
    { key: "semester", header: "Semester", render: (r) => r.semester },
    { key: "amount", header: "Amount", render: (r) => inr(r.amount) },
    {
      key: "paid",
      header: "Paid",
      render: (r) => (
        <div className="w-28">
          <p className="mb-1 text-xs">{inr(r.paid)}</p>
          <ProgressBar value={r.amount > 0 ? (r.paid / r.amount) * 100 : 0} />
        </div>
      ),
    },
    { key: "dueDate", header: "Due date", render: (r) => r.dueDate },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "action",
      header: "",
      render: (r) =>
        isStudent(role) ? (
          <ActionCell labels={["Pay now"]} />
        ) : r.status === "Paid" ? (
          <span className="text-xs text-muted-foreground">Paid</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnRole}
              onClick={() =>
                setFeeRows((prev) =>
                  prev.map((item) =>
                    item.id === r.id ? { ...item, paid: item.amount, status: "Paid" } : item,
                  ),
                )
              }
            >
              Mark paid
            </button>
            <button
              type="button"
              className={btn}
              onClick={() =>
                setRemindedFees((prev) => (prev.includes(r.id) ? prev : [...prev, r.id]))
              }
            >
              {remindedFees.includes(r.id) ? "Reminder sent" : "Remind"}
            </button>
          </div>
        ),
    },
  ];
  const totalAmount = rows.reduce((a, f) => a + f.amount, 0);
  const paid = rows.reduce((a, f) => a + f.paid, 0);
  const due = rows.reduce((a, f) => a + Math.max(0, f.amount - f.paid), 0);
  const clearedCount = rows.filter((r) => r.status === "Paid").length;

  const donutProgress = isStudent(role)
    ? totalAmount > 0
      ? Math.min(100, Math.round((paid / totalAmount) * 100))
      : rows.length > 0
        ? 100
        : 0
    : feeCollection.collectedPct;

  const handleDownload = () => {
    const filename = isStudent(role) ? "my-fee-receipts.csv" : "hostel-fee-ledger.csv";
    downloadFeesCsv(rows, filename);
  };

  return (
    <>
      <PageHeader
        title={isStudent(role) ? "My Fees" : "Fees Management"}
        description={
          isStudent(role)
            ? "Track your hostel and mess payments."
            : "All fee records, collection status and dues."
        }
        action={
          <button
            type="button"
            className={`${btnRole}${isStudent(role) && (loading || rows.length === 0) ? " cursor-not-allowed opacity-50" : ""}`}
            onClick={handleDownload}
            disabled={isStudent(role) && (loading || rows.length === 0)}
          >
            {isStudent(role) ? "Download receipts" : "Export ledger"}
          </button>
        }
      />
      {isStudent(role) && loading ? (
        <div className="panel flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
          <Loader2 className="size-8 animate-spin text-role" />
          <p className="text-sm font-medium text-muted-foreground">Loading fee records…</p>
        </div>
      ) : isStudent(role) && error ? (
        <div className="panel flex min-h-64 flex-col items-center justify-center gap-3 border-danger/30 bg-danger/5 p-8 text-center">
          <AlertCircle className="size-8 text-danger" />
          <p className="font-semibold text-danger">Unable to load fee records</p>
          <p className="max-w-md text-sm text-muted-foreground">{error}</p>
          <button type="button" className={btnRole} onClick={() => void fetchStudentFees()}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 lg:grid-cols-4">
            <StatCard icon={IndianRupee} label="Paid" value={inr(paid)} />
            <StatCard icon={Clock} label="Outstanding" value={inr(due)} />
            <StatCard icon={CheckCircle2} label="Cleared invoices" value={String(clearedCount)} />
            <Panel className="flex items-center justify-center py-2">
              <DonutProgress
                value={donutProgress}
                label={isStudent(role) ? "of your dues cleared" : "collected"}
              />
            </Panel>
          </div>
          <DataTable
            title="Fee records"
            rows={rows}
            columns={cols}
            searchKeys={["student", "id", "semester", "status"]}
            emptyText="No fee records found"
          />
        </>
      )}
    </>
  );
}

/* ---------------- Complaints ---------------- */
const formatRaisedAt = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export function ComplaintsPage({ role }: { role: Role }) {
  const [complaintRows, setComplaintRows] = usePersistentState("hotelsync-complaints", complaints);
  const [studentComplaints, setStudentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(isStudent(role));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentStudentProfile, setCurrentStudentProfile] = useState<{
    name: string;
    roomNo: string;
  }>({ name: "", roomNo: "" });

  const [form, setForm] = useState({
    category: "Water" as Complaint["category"],
    roomNo: "",
    priority: "Normal",
    description: "",
  });

  const formRef = useRef<HTMLDivElement>(null);

  const fetchStudentComplaints = useCallback(async () => {
    if (!isStudent(role)) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const userId = session?.user?.id;
      if (!userId) {
        setStudentComplaints([]);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, room_no")
        .eq("id", userId)
        .maybeSingle();

      const userMeta = (session?.user?.user_metadata ?? {}) as Record<string, unknown>;
      const resolvedName =
        profile?.full_name ||
        (typeof userMeta.full_name === "string" && userMeta.full_name.trim()) ||
        session?.user?.email?.split("@")[0] ||
        "Student";
      const resolvedRoom =
        profile?.room_no || (typeof userMeta.room_no === "string" && userMeta.room_no.trim()) || "";

      setCurrentStudentProfile({ name: resolvedName, roomNo: resolvedRoom });
      setForm((prev) => ({ ...prev, roomNo: prev.roomNo || resolvedRoom }));

      const { data, error: fetchError } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const mapped: Complaint[] = (data || []).map((row) => ({
        id: row.id,
        student: row.student_name ?? resolvedName,
        roomNo: row.room_no ?? resolvedRoom,
        category: (row.category as Complaint["category"]) || "Other",
        description: row.description ?? "",
        status: (row.status as Complaint["status"]) || "Pending",
        raisedAt: formatRaisedAt(row.created_at),
      }));

      setStudentComplaints(mapped);
    } catch (err: unknown) {
      console.error("Error fetching student complaints:", err);
      setError(err instanceof Error ? err.message : "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (!isStudent(role)) return;

    void fetchStudentComplaints();

    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void fetchStudentComplaints();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchStudentComplaints, role]);

  const handleExportComplaints = () => {
    const headers = ["Ticket", "Student", "Room", "Category", "Description", "Raised", "Status"];
    const rowsCsv = complaintRows.map((item) =>
      [
        item.id,
        item.student,
        item.roomNo,
        item.category,
        item.description,
        item.raisedAt,
        item.status,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );

    const csv = [headers.join(","), ...rowsCsv].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hostel-complaints.csv";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const rows: Complaint[] = isStudent(role) ? studentComplaints : complaintRows;
  const cols: Column<Complaint>[] = [
    { key: "id", header: "Ticket", render: (r) => <span className="font-medium">{r.id}</span> },
    ...(role === "admin"
      ? [
          {
            key: "student",
            header: "Student",
            render: (r: Complaint) => (
              <div>
                <p className="font-medium">{r.student}</p>
                <p className="text-xs text-muted-foreground">Room {r.roomNo}</p>
              </div>
            ),
          },
        ]
      : []),
    { key: "category", header: "Category", render: (r) => r.category },
    {
      key: "description",
      header: "Description",
      render: (r) => <p className="max-w-sm text-muted-foreground">{r.description}</p>,
    },
    { key: "raisedAt", header: "Raised", render: (r) => r.raisedAt },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "action",
      header: "",
      render: (r) =>
        isStudent(role) ? (
          <ActionCell labels={["View"]} />
        ) : r.status === "Resolved" ? (
          <span className="text-xs text-muted-foreground">Resolved</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btn}
              onClick={() =>
                setComplaintRows((prev) =>
                  prev.map((item) =>
                    item.id === r.id ? { ...item, status: "In Progress" } : item,
                  ),
                )
              }
            >
              In progress
            </button>
            <button
              type="button"
              className={btnRole}
              onClick={() =>
                setComplaintRows((prev) =>
                  prev.map((item) => (item.id === r.id ? { ...item, status: "Resolved" } : item)),
                )
              }
            >
              Resolve
            </button>
          </div>
        ),
    },
  ];

  const handleSubmitComplaint = async () => {
    const description = form.description.trim();
    if (!description) {
      return;
    }

    if (isStudent(role)) {
      setSubmitting(true);
      setSubmitError(null);

      try {
        const supabase = getSupabaseClient();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const userId = session?.user?.id;
        if (!userId) {
          throw new Error("You must be logged in to submit a complaint.");
        }

        const ticketId = `CMP-${Date.now().toString().slice(-6)}`;
        const nowIso = new Date().toISOString();
        const studentName =
          currentStudentProfile.name || session.user.email?.split("@")[0] || "Student";
        const roomNo = form.roomNo.trim() || currentStudentProfile.roomNo || null;

        const payload = {
          id: ticketId,
          user_id: userId,
          student_name: studentName,
          room_no: roomNo,
          category: form.category,
          description,
          status: "Pending",
          created_at: nowIso,
        };

        const { error: insertError } = await supabase.from("complaints").insert(payload);
        if (insertError) {
          throw insertError;
        }

        const newComplaint: Complaint = {
          id: ticketId,
          student: studentName,
          roomNo: roomNo ?? "",
          category: form.category,
          description,
          status: "Pending",
          raisedAt: formatRaisedAt(nowIso),
        };

        setStudentComplaints((prev) => [newComplaint, ...prev]);
        setForm((prev) => ({
          category: "Water",
          roomNo: prev.roomNo,
          priority: "Normal",
          description: "",
        }));
      } catch (err: unknown) {
        console.error("Error submitting complaint:", err);
        setSubmitError(err instanceof Error ? err.message : "Failed to submit complaint.");
      } finally {
        setSubmitting(false);
      }
    } else {
      const newComplaint: Complaint = {
        id: `CMP-${Date.now().toString().slice(-6)}`,
        student: currentStudent.name,
        roomNo: form.roomNo,
        category: form.category,
        description,
        status: "Pending",
        raisedAt: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };

      setComplaintRows((prev) => [newComplaint, ...prev]);
      setForm({
        category: "Water",
        roomNo: currentStudent.roomNo,
        priority: "Normal",
        description: "",
      });
    }
  };

  return (
    <>
      <PageHeader
        title={isStudent(role) ? "My Complaints" : "Complaints"}
        description={
          isStudent(role)
            ? "Raise an issue and track it until it is resolved."
            : "Every reported issue across the hostel."
        }
        action={
          <button
            type="button"
            className={btnRole}
            onClick={
              isStudent(role)
                ? () => formRef.current?.scrollIntoView({ behavior: "smooth" })
                : handleExportComplaints
            }
          >
            {isStudent(role) ? "Raise complaint" : "Export list"}
          </button>
        }
      />
      {isStudent(role) ? (
        <Panel className="mb-6">
          <div ref={formRef}>
            <h2 className="mb-4 text-base font-semibold">New complaint</h2>
            {submitError ? (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                <AlertCircle className="size-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1.5 block text-muted-foreground">Category</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      category: event.target.value as Complaint["category"],
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
                >
                  {["Water", "Electricity", "Mess", "WiFi", "Furniture", "Other"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block text-muted-foreground">Room no.</span>
                <input
                  value={form.roomNo}
                  onChange={(event) => setForm((prev) => ({ ...prev, roomNo: event.target.value }))}
                  placeholder="e.g. B-204"
                  className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
                />
              </label>
              <label className="text-sm md:col-span-1">
                <span className="mb-1.5 block text-muted-foreground">Priority</span>
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, priority: event.target.value }))
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
                >
                  <option>Normal</option>
                  <option>Urgent</option>
                </select>
              </label>
              <label className="text-sm md:col-span-3">
                <span className="mb-1.5 block text-muted-foreground">Description</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Describe the issue…"
                  className="w-full rounded-lg border border-input bg-background/60 p-3 text-sm outline-none focus:border-role"
                />
              </label>
            </div>
            <button
              type="button"
              className={btnRole + " mt-4"}
              onClick={handleSubmitComplaint}
              disabled={submitting || !form.description.trim()}
            >
              {submitting ? "Submitting…" : "Submit complaint"}
            </button>
          </div>
        </Panel>
      ) : null}

      {isStudent(role) && loading ? (
        <div className="panel flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
          <Loader2 className="size-8 animate-spin text-role" />
          <p className="text-sm font-medium text-muted-foreground">Loading your complaints…</p>
        </div>
      ) : isStudent(role) && error ? (
        <div className="panel flex min-h-64 flex-col items-center justify-center gap-3 border-danger/30 bg-danger/5 p-8 text-center">
          <AlertCircle className="size-8 text-danger" />
          <p className="font-semibold text-danger">Unable to load complaints</p>
          <p className="max-w-md text-sm text-muted-foreground">{error}</p>
          <button type="button" className={btnRole} onClick={() => void fetchStudentComplaints()}>
            Retry
          </button>
        </div>
      ) : (
        <DataTable
          title="Complaint tickets"
          rows={rows}
          columns={cols}
          searchKeys={["category", "status", "id"]}
          emptyText="No complaints found"
        />
      )}
    </>
  );
}

/* ---------------- Outpass ---------------- */
export function OutpassPage({ role }: { role: Role }) {
  const [outpassRows, setOutpassRows] = usePersistentState("hotelsync-outpasses", outpasses);
  const [studentRows] = usePersistentState("hotelsync-students", students);
  const [notifications, setNotifications] = usePersistentState<ParentNotification[]>(
    "hotelsync-parent-notifications",
    [],
  );
  const [form, setForm] = useState({
    departure: "",
    expectedReturn: "",
    reason: "",
  });

  const handleExportOutpasses = () => {
    const headers = [
      "Request",
      "Student",
      "Roll No",
      "Reason",
      "Departure",
      "Expected Return",
      "Status",
    ];
    const rowsCsv = outpassRows.map((item) =>
      [
        item.id,
        item.student,
        item.rollNo,
        item.reason,
        item.departure,
        item.expectedReturn,
        item.status,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );

    const csv = [headers.join(","), ...rowsCsv].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hostel-outpasses.csv";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const rows = isStudent(role)
    ? outpassRows.filter((o) => o.student === currentStudent.name)
    : outpassRows;

  const handleOutpassDecision = (outpassId: string, status: "Approved" | "Rejected") => {
    const outpass = outpassRows.find((item) => item.id === outpassId);
    if (!outpass || outpass.status !== "Pending") {
      return;
    }

    if (role !== "warden") {
      setOutpassRows((prev) =>
        prev.map((item) => (item.id === outpassId ? { ...item, status } : item)),
      );
      return;
    }

    setOutpassRows((prev) =>
      prev.map((item) => (item.id === outpassId ? { ...item, status } : item)),
    );
  };

  const handleInformParent = (outpassId: string) => {
    const outpass = outpassRows.find((item) => item.id === outpassId);
    const savedStudent = studentRows.find((item) => item.rollNo === outpass?.rollNo);
    const defaultStudent = students.find((item) => item.rollNo === outpass?.rollNo);
    const student = savedStudent ?? defaultStudent;
    const parentPhone = savedStudent?.parentPhone ?? defaultStudent?.parentPhone;
    if (!outpass || !student || outpass.status !== "Approved" || !parentPhone) {
      return;
    }

    const departure = splitOutpassDateTime(outpass.departure);
    const expectedReturn = splitOutpassDateTime(outpass.expectedReturn);
    const message = `HostelSync: ${student.name} has an approved outpass. Leaving ${departure.date} at ${departure.time}; expected to return ${expectedReturn.date} at ${expectedReturn.time}.`;

    setNotifications((prev) => [
      {
        id: `${outpass.id}-parent`,
        recipientType: "parent",
        recipientId: student.parentId,
        recipientPhone: parentPhone,
        outpassId: outpass.id,
        studentName: student.name,
        outPassStatus: "Approved",
        outDate: departure.date,
        outTime: departure.time,
        returnTime: expectedReturn.time,
        message,
        sentAt: new Date().toLocaleString("en-GB"),
      },
      ...prev.filter((item) => item.outpassId !== outpass.id),
    ]);
  };

  const cols: Column<(typeof outpasses)[number]>[] = [
    { key: "id", header: "Request", render: (r) => <span className="font-medium">{r.id}</span> },
    ...(isStudent(role)
      ? []
      : [
          {
            key: "student",
            header: "Student",
            render: (r: (typeof outpasses)[number]) => (
              <div>
                <p className="font-medium">{r.student}</p>
                <p className="text-xs text-muted-foreground">{r.rollNo}</p>
              </div>
            ),
          },
        ]),
    { key: "reason", header: "Reason", render: (r) => r.reason },
    { key: "departure", header: "Departure", render: (r) => r.departure },
    { key: "expectedReturn", header: "Expected return", render: (r) => r.expectedReturn },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "action",
      header: "",
      render: (r) =>
        isStudent(role) ? (
          <button
            type="button"
            className={btn}
            onClick={() => setOutpassRows((prev) => prev.filter((item) => item.id !== r.id))}
          >
            Cancel
          </button>
        ) : r.status === "Pending" ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnRole}
              onClick={() => handleOutpassDecision(r.id, "Approved")}
            >
              Approve
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => handleOutpassDecision(r.id, "Rejected")}
            >
              Reject
            </button>
          </div>
        ) : r.status === "Approved" && role === "warden" ? (
          <div className="flex flex-wrap items-center gap-2">
            {notifications.find(
              (item) => item.outpassId === r.id && item.recipientPhone && item.message,
            ) ? (
              <span className="text-xs text-success">
                SMS sent to {notifications.find((item) => item.outpassId === r.id)?.recipientPhone}
              </span>
            ) : (
              <button type="button" className={btnRole} onClick={() => handleInformParent(r.id)}>
                Inform parent
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Rejected</span>
        ),
    },
  ];

  const handleSubmitOutpass = () => {
    const reason = form.reason.trim();
    const departure = form.departure.trim();
    const expectedReturn = form.expectedReturn.trim();

    if (!reason || !departure || !expectedReturn) {
      return;
    }

    const newOutpass: (typeof outpasses)[number] = {
      id: `OP-${Date.now().toString().slice(-6)}`,
      student: currentStudent.name,
      rollNo: currentStudent.rollNo,
      reason,
      departure: new Date(departure).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      expectedReturn: new Date(expectedReturn).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "Pending",
    };

    setOutpassRows((prev) => [newOutpass, ...prev]);
    setForm({ departure: "", expectedReturn: "", reason: "" });
  };

  return (
    <>
      <PageHeader
        title={isStudent(role) ? "Outpass Request" : "Outpass Requests"}
        description={
          isStudent(role)
            ? "Apply for a short exit and track approval."
            : "Approve or reject student exit requests."
        }
        action={
          !isStudent(role) ? (
            <button type="button" className={btnRole} onClick={handleExportOutpasses}>
              Export log
            </button>
          ) : undefined
        }
      />
      {isStudent(role) ? (
        <Panel className="mb-6">
          <h2 className="mb-4 text-base font-semibold">New outpass</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Departure</span>
              <input
                type="datetime-local"
                value={form.departure}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, departure: event.target.value }))
                }
                className="outpass-date-input h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Expected return</span>
              <input
                type="datetime-local"
                value={form.expectedReturn}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, expectedReturn: event.target.value }))
                }
                className="outpass-date-input h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Reason</span>
              <input
                value={form.reason}
                onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
                placeholder="Reason for exit"
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
          </div>
          <button type="button" className={btnRole + " mt-4"} onClick={handleSubmitOutpass}>
            Submit request
          </button>
        </Panel>
      ) : null}
      <DataTable
        title="Outpass history"
        rows={rows}
        columns={cols}
        searchKeys={["student", "reason", "status", "id"]}
      />
    </>
  );
}

/* ---------------- Leave ---------------- */
export function LeavePage({ role }: { role: Role }) {
  const [leaveRows, setLeaveRows] = usePersistentState("hotelsync-leaves", leaves);
  const [form, setForm] = useState({
    from: "",
    to: "",
    reason: "",
  });

  const rows = isStudent(role)
    ? leaveRows.filter((l) => l.student === currentStudent.name)
    : leaveRows;
  const cols: Column<(typeof leaves)[number]>[] = [
    { key: "id", header: "Request", render: (r) => <span className="font-medium">{r.id}</span> },
    ...(isStudent(role)
      ? []
      : [{ key: "student", header: "Student", render: (r: (typeof leaves)[number]) => r.student }]),
    { key: "from", header: "From", render: (r) => r.from },
    { key: "to", header: "To", render: (r) => r.to },
    { key: "reason", header: "Reason", render: (r) => r.reason },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "action",
      header: "",
      render: (r) =>
        isStudent(role) ? (
          <ActionCell labels={["Withdraw"]} />
        ) : r.status === "Pending" ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnRole}
              onClick={() =>
                setLeaveRows((prev) =>
                  prev.map((item) => (item.id === r.id ? { ...item, status: "Approved" } : item)),
                )
              }
            >
              Approve
            </button>
            <button
              type="button"
              className={btn}
              onClick={() =>
                setLeaveRows((prev) =>
                  prev.map((item) => (item.id === r.id ? { ...item, status: "Rejected" } : item)),
                )
              }
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{r.status}</span>
        ),
    },
  ];

  const handleSubmitLeave = () => {
    const from = form.from.trim();
    const to = form.to.trim();
    const reason = form.reason.trim();

    if (!from || !to || !reason) {
      return;
    }

    const newLeave: (typeof leaves)[number] = {
      id: `LV-${Date.now().toString().slice(-6)}`,
      student: currentStudent.name,
      from: new Date(from).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      to: new Date(to).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      reason,
      status: "Pending",
    };

    setLeaveRows((prev) => [newLeave, ...prev]);
    setForm({ from: "", to: "", reason: "" });
  };

  return (
    <>
      <PageHeader
        title={isStudent(role) ? "Leave" : "Leave Requests"}
        description={
          isStudent(role)
            ? "Apply for multi-day leave from the hostel."
            : "Review long-duration leave applications."
        }
      />
      {isStudent(role) ? (
        <Panel className="mb-6">
          <h2 className="mb-4 text-base font-semibold">Apply for leave</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">From</span>
              <input
                type="date"
                value={form.from}
                onChange={(event) => setForm((prev) => ({ ...prev, from: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">To</span>
              <input
                type="date"
                value={form.to}
                onChange={(event) => setForm((prev) => ({ ...prev, to: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Reason</span>
              <input
                value={form.reason}
                onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
                placeholder="Reason for leave"
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
          </div>
          <button type="button" className={btnRole + " mt-4"} onClick={handleSubmitLeave}>
            Submit application
          </button>
        </Panel>
      ) : null}
      <DataTable
        title="Leave applications"
        rows={rows}
        columns={cols}
        searchKeys={["student", "reason", "status", "id"]}
      />
    </>
  );
}

/* ---------------- Attendance ---------------- */
export function AttendancePage({ role }: { role: Role }) {
  const [attendanceRows, setAttendanceRows] = usePersistentState(
    "hotelsync-attendance",
    attendance,
  );

  const handleMarkTodayBulk = () => {
    setAttendanceRows((prev) => prev.map((row) => ({ ...row, status: "Present" })));
  };

  const rows = isStudent(role)
    ? attendanceRows.filter((a) => a.student === currentStudent.name)
    : attendanceRows;
  const cols: Column<(typeof attendance)[number]>[] = [
    { key: "date", header: "Date", render: (r) => <span className="font-medium">{r.date}</span> },
    ...(isStudent(role)
      ? []
      : [
          {
            key: "student",
            header: "Student",
            render: (r: (typeof attendance)[number]) => (
              <div>
                <p className="font-medium">{r.student}</p>
                <p className="text-xs text-muted-foreground">Room {r.roomNo}</p>
              </div>
            ),
          },
        ]),
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "markedBy", header: "Marked by", render: (r) => r.markedBy },
    ...(role === "warden"
      ? [
          {
            key: "action",
            header: "",
            render: (r: (typeof attendance)[number]) => (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btn}
                  onClick={() =>
                    setAttendanceRows((prev) =>
                      prev.map((row) =>
                        row.date === r.date && row.student === r.student
                          ? { ...row, status: "Present" }
                          : row,
                      ),
                    )
                  }
                >
                  Present
                </button>
                <button
                  type="button"
                  className={btn}
                  onClick={() =>
                    setAttendanceRows((prev) =>
                      prev.map((row) =>
                        row.date === r.date && row.student === r.student
                          ? { ...row, status: "Absent" }
                          : row,
                      ),
                    )
                  }
                >
                  Absent
                </button>
                <button
                  type="button"
                  className={btn}
                  onClick={() =>
                    setAttendanceRows((prev) =>
                      prev.map((row) =>
                        row.date === r.date && row.student === r.student
                          ? { ...row, status: "Leave" }
                          : row,
                      ),
                    )
                  }
                >
                  Leave
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];
  const present = rows.filter((r) => r.status === "Present").length;
  return (
    <>
      <PageHeader
        title={isStudent(role) ? "My Attendance" : "Attendance"}
        description={
          isStudent(role)
            ? "Your daily hostel attendance record."
            : "Mark and monitor daily room attendance."
        }
        action={
          !isStudent(role) ? (
            <button type="button" className={btnRole} onClick={handleMarkTodayBulk}>
              Mark today (bulk)
            </button>
          ) : undefined
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={CheckCircle2} label="Present days" value={String(present)} />
        <StatCard
          icon={XCircle}
          label="Absent days"
          value={String(rows.filter((r) => r.status === "Absent").length)}
        />
        <StatCard
          icon={Clock}
          label="Attendance rate"
          value={rows.length ? Math.round((present / rows.length) * 100) + "%" : "—"}
        />
      </div>
      <DataTable
        title="Attendance log"
        rows={rows}
        columns={cols}
        searchKeys={["student", "date", "status"]}
      />
    </>
  );
}

/* ---------------- Students ---------------- */
export function StudentsPage({ role }: { role: Role }) {
  const [studentRows, setStudentRows] = usePersistentState("hotelsync-students", students);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<(typeof students)[number] | null>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    course: "",
    year: "Year 1",
    roomNo: "",
    phone: "",
    email: "",
    parentName: "",
    parentPhone: "",
    parentRelation: "Father",
    parentEmail: "",
    homeAddress: "",
    bloodGroup: "",
    dateOfJoining: "",
    status: "Active" as (typeof students)[number]["status"],
  });

  const cols: Column<(typeof students)[number]>[] = [
    {
      key: "name",
      header: "Student",
      render: (r) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-role/20 text-sm font-semibold text-role">
            {r.name.charAt(0)}
          </span>
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.rollNo}</p>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      header: "Course",
      render: (r) => (
        <div>
          <p>{r.course}</p>
          <p className="text-xs text-muted-foreground">{r.year}</p>
        </div>
      ),
    },
    { key: "roomNo", header: "Room", render: (r) => r.roomNo },
    { key: "phone", header: "Phone", render: (r) => r.phone },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "action",
      header: "",
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={() => setViewingStudent(r)}>
            View
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btn}
              onClick={() => {
                setEditingStudentId(r.id);
                setForm({
                  name: r.name,
                  rollNo: r.rollNo,
                  course: r.course,
                  year: r.year,
                  roomNo: r.roomNo,
                  phone: r.phone,
                  email: r.email ?? "",
                  parentName: r.parentName ?? "",
                  parentPhone: r.parentPhone ?? "",
                  parentRelation: r.parentRelation ?? "Father",
                  parentEmail: r.parentEmail ?? "",
                  homeAddress: r.homeAddress ?? "",
                  bloodGroup: r.bloodGroup ?? "",
                  dateOfJoining: r.dateOfJoining ?? "",
                  status: r.status,
                });
                formPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className={btn}
              onClick={() =>
                setStudentRows((prev) => prev.filter((student) => student.id !== r.id))
              }
            >
              Remove
            </button>
          </div>
        </div>
      ),
    },
  ];

  const handleAddStudent = () => {
    const name = form.name.trim();
    const rollNo = form.rollNo.trim();
    const course = form.course.trim();
    const roomNo = form.roomNo.trim();
    const phone = form.phone.trim();

    if (!name || !rollNo || !course || !roomNo || !phone) {
      return;
    }

    const studentDetails = {
      name,
      rollNo,
      course,
      roomNo,
      year: form.year,
      status: form.status,
      phone,
      email: form.email.trim(),
      parentName: form.parentName.trim(),
      parentPhone: form.parentPhone.trim(),
      parentRelation: form.parentRelation.trim(),
      parentEmail: form.parentEmail.trim(),
      homeAddress: form.homeAddress.trim(),
      bloodGroup: form.bloodGroup.trim(),
      dateOfJoining: form.dateOfJoining.trim(),
    };

    if (editingStudentId) {
      setStudentRows((prev) =>
        prev.map((student) =>
          student.id === editingStudentId ? { ...student, ...studentDetails } : student,
        ),
      );
      setEditingStudentId(null);
    } else {
      const newStudentId = `S-${Date.now().toString().slice(-4)}`;
      setStudentRows((prev) => [
        { id: newStudentId, parentId: `P-${newStudentId.slice(2)}`, ...studentDetails },
        ...prev,
      ]);
    }
    setForm({
      name: "",
      rollNo: "",
      course: "",
      year: "Year 1",
      roomNo: "",
      phone: "",
      email: "",
      parentName: "",
      parentPhone: "",
      parentRelation: "Father",
      parentEmail: "",
      homeAddress: "",
      bloodGroup: "",
      dateOfJoining: "",
      status: "Active",
    });
  };

  return (
    <>
      <PageHeader
        title="Students"
        description={`Student records and contact details. ${role === "admin" ? "Admins" : "Wardens"} can maintain profiles.`}
      />
      <div ref={formPanelRef}>
        <Panel className="mb-6">
          <h2 className="mb-4 text-base font-semibold">
            {editingStudentId ? "Edit student" : "Add student"}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Roll no.</span>
              <input
                value={form.rollNo}
                onChange={(event) => setForm((prev) => ({ ...prev, rollNo: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Course</span>
              <input
                value={form.course}
                onChange={(event) => setForm((prev) => ({ ...prev, course: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Year</span>
              <select
                value={form.year}
                onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              >
                {["Year 1", "Year 2", "Year 3", "Year 4"].map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Room no.</span>
              <input
                value={form.roomNo}
                onChange={(event) => setForm((prev) => ({ ...prev, roomNo: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Phone</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm md:col-span-1">
              <span className="mb-1.5 block text-muted-foreground">Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as (typeof students)[number]["status"],
                  }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Email</span>
              <input
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Parent name</span>
              <input
                value={form.parentName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, parentName: event.target.value }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Parent contact</span>
              <input
                value={form.parentPhone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, parentPhone: event.target.value }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Parent relation</span>
              <input
                value={form.parentRelation}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, parentRelation: event.target.value }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Parent email</span>
              <input
                value={form.parentEmail}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, parentEmail: event.target.value }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1.5 block text-muted-foreground">Home address</span>
              <input
                value={form.homeAddress}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, homeAddress: event.target.value }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Blood group (optional)</span>
              <input
                value={form.bloodGroup}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, bloodGroup: event.target.value }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Date of joining</span>
              <input
                value={form.dateOfJoining}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, dateOfJoining: event.target.value }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" className={btnRole} onClick={handleAddStudent}>
              {editingStudentId ? "Save changes" : "Add student"}
            </button>
            {editingStudentId ? (
              <button
                type="button"
                className={btn}
                onClick={() => {
                  setEditingStudentId(null);
                  setForm({
                    name: "",
                    rollNo: "",
                    course: "",
                    year: "Year 1",
                    roomNo: "",
                    phone: "",
                    email: "",
                    parentName: "",
                    parentPhone: "",
                    parentRelation: "Father",
                    parentEmail: "",
                    homeAddress: "",
                    bloodGroup: "",
                    dateOfJoining: "",
                    status: "Active",
                  });
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </Panel>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total students"
          value={String(studentRows.length * 32)}
          hint="Across all blocks"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active"
          value={String(studentRows.filter((s) => s.status === "Active").length * 32)}
        />
        <StatCard icon={DoorOpen} label="On outpass today" value="12" />
      </div>
      <DataTable
        title="Students overview"
        rows={studentRows}
        columns={cols}
        searchKeys={["name", "rollNo", "course", "roomNo"]}
      />
      {viewingStudent ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${viewingStudent.name} profile`}
        >
          <Panel className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{viewingStudent.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {viewingStudent.rollNo} · Student profile
                </p>
              </div>
              <button type="button" className={btn} onClick={() => setViewingStudent(null)}>
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {[
                ["Course", `${viewingStudent.course} · ${viewingStudent.year}`],
                ["Room", viewingStudent.roomNo],
                ["Phone", viewingStudent.phone],
                ["Email", viewingStudent.email],
                ["Parent name", viewingStudent.parentName],
                ["Parent relation", viewingStudent.parentRelation],
                ["Parent contact", viewingStudent.parentPhone],
                ["Parent email", viewingStudent.parentEmail],
                ["Home address", viewingStudent.homeAddress],
                ["Blood group", viewingStudent.bloodGroup || "Not provided"],
                ["Date of joining", viewingStudent.dateOfJoining],
                ["Status", viewingStudent.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm">{value || "Not provided"}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}
    </>
  );
}

/* ---------------- Rooms ---------------- */
export function RoomsPage({ role }: { role: Role }) {
  const readOnly = role === "warden";
  const [roomRows, setRoomRows] = usePersistentState("hotelsync-rooms", rooms);
  const [form, setForm] = useState({
    roomNo: "",
    block: "A Block",
    floor: "1st",
    capacity: "2",
    occupied: "0",
    status: "Available" as (typeof rooms)[number]["status"],
  });

  const cols: Column<(typeof rooms)[number]>[] = [
    {
      key: "roomNo",
      header: "Room",
      render: (r) => <span className="font-medium">{r.roomNo}</span>,
    },
    {
      key: "block",
      header: "Block",
      render: (r) => (
        <div>
          <p>{r.block}</p>
          <p className="text-xs text-muted-foreground">{r.floor} floor</p>
        </div>
      ),
    },
    {
      key: "occupancy",
      header: "Occupancy",
      render: (r) => (
        <div className="w-32">
          <p className="mb-1 text-xs">
            {r.occupied}/{r.capacity} beds
          </p>
          <ProgressBar value={(r.occupied / r.capacity) * 100} />
        </div>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "action",
      header: "",
      render: () => <ActionCell labels={readOnly ? ["View"] : ["Allocate", "Edit"]} />,
    },
  ];

  const handleAddRoom = () => {
    const roomNo = form.roomNo.trim();
    const capacity = Number(form.capacity);
    const occupied = Number(form.occupied);

    if (!roomNo || Number.isNaN(capacity) || Number.isNaN(occupied) || capacity <= 0) {
      return;
    }

    const newRoom: (typeof rooms)[number] = {
      roomNo,
      block: form.block,
      floor: form.floor,
      capacity,
      occupied: Math.min(occupied, capacity),
      status: form.status,
    };

    setRoomRows((prev) => [newRoom, ...prev]);
    setForm({
      roomNo: "",
      block: "A Block",
      floor: "1st",
      capacity: "2",
      occupied: "0",
      status: "Available",
    });
  };

  const beds = roomRows.reduce((a, r) => a + r.capacity, 0);
  const used = roomRows.reduce((a, r) => a + r.occupied, 0);
  return (
    <>
      <PageHeader
        title="Rooms"
        description={
          readOnly ? "Block-wise room occupancy." : "Add rooms, edit details and allocate beds."
        }
      />
      {!readOnly ? (
        <Panel className="mb-6">
          <h2 className="mb-4 text-base font-semibold">Add room</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Room no.</span>
              <input
                value={form.roomNo}
                onChange={(event) => setForm((prev) => ({ ...prev, roomNo: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Block</span>
              <select
                value={form.block}
                onChange={(event) => setForm((prev) => ({ ...prev, block: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              >
                {["A Block", "B Block", "C Block"].map((block) => (
                  <option key={block}>{block}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Floor</span>
              <select
                value={form.floor}
                onChange={(event) => setForm((prev) => ({ ...prev, floor: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              >
                {["1st", "2nd", "3rd", "4th"].map((floor) => (
                  <option key={floor}>{floor}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Capacity</span>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Occupied</span>
              <input
                type="number"
                min="0"
                value={form.occupied}
                onChange={(event) => setForm((prev) => ({ ...prev, occupied: event.target.value }))}
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as (typeof rooms)[number]["status"],
                  }))
                }
                className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:border-role"
              >
                <option value="Available">Available</option>
                <option value="Full">Full</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </label>
          </div>
          <button type="button" className={btnRole + " mt-4"} onClick={handleAddRoom}>
            Add room
          </button>
        </Panel>
      ) : null}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={BedDouble} label="Total rooms" value={String(roomRows.length * 18)} />
        <StatCard
          icon={Users}
          label="Occupancy"
          value={beds ? Math.round((used / beds) * 100) + "%" : "0%"}
          hint={`${used}/${beds} sample beds`}
        />
        <StatCard
          icon={Clock}
          label="Under maintenance"
          value={String(roomRows.filter((r) => r.status === "Maintenance").length)}
        />
      </div>
      <DataTable
        title="Room inventory"
        rows={roomRows}
        columns={cols}
        searchKeys={["roomNo", "block", "status"]}
      />
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
            {[
              ["Block", currentStudent.block],
              ["Floor", currentStudent.floor],
              ["Capacity", "3 beds"],
              ["Allotted on", currentStudent.dateOfJoining],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <button className={btnRole + " mt-5 w-full justify-center"}>Request room change</button>
        </Panel>
        <Panel className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Roommates</h2>
          <div className="space-y-3">
            {roommates.map((m) => (
              <div
                key={m.rollNo}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-role/20 font-semibold text-role">
                  {m.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.rollNo} · {m.course}
                  </p>
                </div>
                <span className="ml-auto text-sm text-muted-foreground">{m.phone}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-border bg-role-soft p-4 text-sm">
            <p className="font-medium">Room rules</p>
            <p className="mt-1 text-muted-foreground">
              Lights out by 11:30 PM · No cooking appliances · Report damages within 24 hours.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
