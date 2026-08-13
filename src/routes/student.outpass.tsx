import { createFileRoute } from "@tanstack/react-router";
import { OutpassPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/student/outpass")({
  head: () => ({
    meta: [
      { title: "Outpass Request — HMS Student" },
      { name: "description", content: "Apply for a hostel outpass and track approval status." },
      { property: "og:title", content: "Outpass Request — HMS Student" },
      { property: "og:description", content: "Apply for a hostel outpass and track approval status." },
    ],
  }),
  component: () => <OutpassPage role="student" />,
});
