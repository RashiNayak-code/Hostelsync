import { createFileRoute } from "@tanstack/react-router";
import { StudentsPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/warden/students")({
  head: () => ({
    meta: [
      { title: "Students — HMS Warden" },
      { name: "description", content: "Read-only overview of hostel residents and their rooms." },
      { property: "og:title", content: "Students — HMS Warden" },
      { property: "og:description", content: "Read-only overview of hostel residents and their rooms." },
    ],
  }),
  component: () => <StudentsPage role="warden" />,
});
