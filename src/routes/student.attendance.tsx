import { createFileRoute } from "@tanstack/react-router";
import { AttendancePage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/student/attendance")({
  head: () => ({
    meta: [
      { title: "My Attendance — HMS Student" },
      { name: "description", content: "Your daily hostel attendance record and rate." },
      { property: "og:title", content: "My Attendance — HMS Student" },
      { property: "og:description", content: "Your daily hostel attendance record and rate." },
    ],
  }),
  component: () => <AttendancePage role="student" />,
});
