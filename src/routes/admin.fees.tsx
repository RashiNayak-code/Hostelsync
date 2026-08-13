import { createFileRoute } from "@tanstack/react-router";
import { FeesPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/admin/fees")({
  head: () => ({
    meta: [
      { title: "Fees Management — HMS Admin" },
      { name: "description", content: "All fee records, collection percentage, dues and reminders." },
      { property: "og:title", content: "Fees Management — HMS Admin" },
      { property: "og:description", content: "All fee records, collection percentage, dues and reminders." },
    ],
  }),
  component: () => <FeesPage role="admin" />,
});
