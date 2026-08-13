import { createFileRoute } from "@tanstack/react-router";
import { AttendancePage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/warden/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — HMS Warden" },
      { name: "description", content: "Mark nightly room attendance and review the log." },
      { property: "og:title", content: "Attendance — HMS Warden" },
      { property: "og:description", content: "Mark nightly room attendance and review the log." },
    ],
  }),
  component: () => <AttendancePage role="warden" />,
});
