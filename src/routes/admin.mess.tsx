import { createFileRoute } from "@tanstack/react-router";
import { MessPage } from "@/components/hms/pages/misc";

export const Route = createFileRoute("/admin/mess")({
  head: () => ({
    meta: [
      { title: "Mess Timetable — HMS Admin" },
      { name: "description", content: "Edit the weekly mess menu and meal timings." },
      { property: "og:title", content: "Mess Timetable — HMS Admin" },
      { property: "og:description", content: "Edit the weekly mess menu and meal timings." },
    ],
  }),
  component: () => <MessPage role="admin" />,
});
