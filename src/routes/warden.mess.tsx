import { createFileRoute } from "@tanstack/react-router";
import { MessPage } from "@/components/hms/pages/misc";

export const Route = createFileRoute("/warden/mess")({
  head: () => ({
    meta: [
      { title: "Mess Timetable — HMS Warden" },
      { name: "description", content: "Weekly hostel mess menu and meal timings." },
      { property: "og:title", content: "Mess Timetable — HMS Warden" },
      { property: "og:description", content: "Weekly hostel mess menu and meal timings." },
    ],
  }),
  component: () => <MessPage role="warden" />,
});
