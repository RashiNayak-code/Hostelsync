import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import {
  attendanceTrend as fallbackAttendance,
  complaints as fallbackComplaints,
  fees as fallbackFees,
  leaves as fallbackLeaves,
  notices as fallbackNotices,
  outpasses as fallbackOutpasses,
  rooms as fallbackRooms,
  students as fallbackStudents,
  type Complaint,
  type Fee,
  type Leave,
  type Notice,
  type Outpass,
  type Room,
  type Student,
} from "@/data/hms";

type DashboardData = {
  fees: Fee[];
  complaints: Complaint[];
  notices: Notice[];
  outpasses: Outpass[];
  leaves: Leave[];
  attendance: typeof fallbackAttendance;
  students: Student[];
  rooms: Room[];
  loading: boolean;
};

const initialData: DashboardData = {
  fees: fallbackFees,
  complaints: fallbackComplaints,
  notices: fallbackNotices,
  outpasses: fallbackOutpasses,
  leaves: fallbackLeaves,
  attendance: fallbackAttendance,
  students: fallbackStudents,
  rooms: fallbackRooms,
  loading: true,
};

function feeStatus(amount: number, paid: number, dueDate: string): Fee["status"] {
  if (paid >= amount) return "Paid";
  if (new Date(dueDate).getTime() < Date.now()) return "Overdue";
  return "Pending";
}

export function useHmsDashboardData(userId?: string, loadAll = false): DashboardData {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseClient();

    const load = async () => {
      const [
        feeResult,
        complaintResult,
        noticeResult,
        outpassResult,
        leaveResult,
        attendanceResult,
        studentResult,
        roomResult,
      ] = await Promise.all([
        loadAll
          ? supabase.from("fees").select("*").order("due_date")
          : userId
            ? supabase.from("fees").select("*").eq("user_id", userId).order("due_date")
            : Promise.resolve({ data: null, error: null }),
        loadAll
          ? supabase.from("complaints").select("*").order("created_at", { ascending: false })
          : userId
            ? supabase
                .from("complaints")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
            : Promise.resolve({ data: null, error: null }),
        supabase.from("notices").select("*").order("posted_at", { ascending: false }).limit(20),
        loadAll
          ? supabase.from("outpasses").select("*").order("departure", { ascending: false })
          : userId
            ? supabase
                .from("outpasses")
                .select("*")
                .eq("user_id", userId)
                .order("departure", { ascending: false })
            : Promise.resolve({ data: null, error: null }),
        loadAll
          ? supabase.from("leave_requests").select("*").order("from_date", { ascending: false })
          : userId
            ? supabase
                .from("leave_requests")
                .select("*")
                .eq("user_id", userId)
                .order("from_date", { ascending: false })
            : Promise.resolve({ data: null, error: null }),
        loadAll
          ? supabase
              .from("attendance")
              .select("date, status")
              .order("date", { ascending: true })
              .limit(30)
          : userId
            ? supabase
                .from("attendance")
                .select("date, status")
                .eq("user_id", userId)
                .order("date", { ascending: true })
                .limit(30)
            : Promise.resolve({ data: null, error: null }),
        loadAll
          ? supabase.from("students").select("*").order("name")
          : Promise.resolve({ data: null, error: null }),
        loadAll
          ? supabase.from("rooms").select("*").order("room_no")
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (!active) return;

      const feeRows = feeResult.data;
      const complaintRows = complaintResult.data;
      const noticeRows = noticeResult.data;
      const outpassRows = outpassResult.data;
      const leaveRows = leaveResult.data;
      const attendanceRows = attendanceResult.data;
      const studentRows = studentResult.data;
      const roomRows = roomResult.data;

      setData({
        fees:
          feeRows && !feeResult.error
            ? feeRows.map((row) => ({
                id: row.id,
                student: row.student_name ?? "",
                rollNo: row.roll_no ?? "",
                semester: row.semester ?? "",
                amount: Number(row.amount ?? 0),
                paid: Number(row.paid ?? 0),
                dueDate: row.due_date ?? "",
                status: feeStatus(
                  Number(row.amount ?? 0),
                  Number(row.paid ?? 0),
                  row.due_date ?? "",
                ),
                method: row.method ?? undefined,
              }))
            : fallbackFees,
        complaints:
          complaintRows && !complaintResult.error
            ? complaintRows.map((row) => ({
                id: row.id,
                student: row.student_name ?? "",
                roomNo: row.room_no ?? "",
                category: row.category,
                description: row.description ?? "",
                status: row.status,
                raisedAt: row.created_at ? new Date(row.created_at).toLocaleDateString() : "",
              }))
            : fallbackComplaints,
        notices:
          noticeRows && !noticeResult.error
            ? noticeRows.map((row) => ({
                id: row.id,
                title: row.title,
                body: row.body,
                audience: row.audience ?? "All residents",
                postedAt: row.posted_at ?? row.created_at ?? "",
                pinned: Boolean(row.pinned),
              }))
            : fallbackNotices,
        outpasses:
          outpassRows && !outpassResult.error
            ? outpassRows.map((row) => ({
                id: row.id,
                student: row.student_name ?? "",
                rollNo: row.roll_no ?? "",
                reason: row.reason ?? "",
                departure: row.departure ?? "",
                expectedReturn: row.expected_return ?? "",
                status: row.status,
              }))
            : fallbackOutpasses,
        leaves:
          leaveRows && !leaveResult.error
            ? leaveRows.map((row) => ({
                id: row.id,
                student: row.student_name ?? "",
                from: row.from_date ?? "",
                to: row.to_date ?? "",
                reason: row.reason ?? "",
                status: row.status,
              }))
            : fallbackLeaves,
        attendance:
          attendanceRows && !attendanceResult.error
            ? attendanceRows.map((row) => ({
                day: new Date(row.date).toLocaleDateString("en-US", { weekday: "short" }),
                present: row.status === "Present" ? 100 : 0,
              }))
            : fallbackAttendance,
        students:
          studentRows && !studentResult.error
            ? studentRows.map((row) => ({
                id: row.id,
                parentId: row.parent_id ?? "",
                name: row.name,
                rollNo: row.roll_no,
                course: row.course,
                roomNo: row.room_no ?? "",
                year: row.year ?? "",
                status: row.status,
                phone: row.phone ?? "",
                parentName: row.parent_name ?? undefined,
                parentPhone: row.parent_phone ?? undefined,
                parentRelation: row.parent_relation ?? undefined,
                parentEmail: row.parent_email ?? undefined,
                homeAddress: row.home_address ?? undefined,
                bloodGroup: row.blood_group ?? undefined,
                email: row.email ?? undefined,
                dateOfJoining: row.date_of_joining ?? undefined,
              }))
            : fallbackStudents,
        rooms:
          roomRows && !roomResult.error
            ? roomRows.map((row) => ({
                roomNo: row.room_no,
                block: row.block,
                floor: row.floor,
                capacity: Number(row.capacity ?? 0),
                occupied: Number(row.occupied ?? 0),
                status: row.status,
              }))
            : fallbackRooms,
        loading: false,
      });
    };

    void load();
    return () => {
      active = false;
    };
  }, [loadAll, userId]);

  return data;
}
