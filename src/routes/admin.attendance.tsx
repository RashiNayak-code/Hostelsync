import { createFileRoute } from "@tanstack/react-router";
import { AttendancePage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/admin/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — HMS Admin" },
      { name: "description", content: "Mark and monitor daily hostel attendance for all residents." },
      { property: "og:title", content: "Attendance — HMS Admin" },
      { property: "og:description", content: "Mark and monitor daily hostel attendance for all residents." },
    ],
  }),
  component: () => <AttendancePage role="admin" />,
});
