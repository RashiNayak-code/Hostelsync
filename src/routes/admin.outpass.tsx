import { createFileRoute } from "@tanstack/react-router";
import { OutpassPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/admin/outpass")({
  head: () => ({
    meta: [
      { title: "Outpass Requests — HMS Admin" },
      { name: "description", content: "Approve or reject student outpass requests." },
      { property: "og:title", content: "Outpass Requests — HMS Admin" },
      { property: "og:description", content: "Approve or reject student outpass requests." },
    ],
  }),
  component: () => <OutpassPage role="admin" />,
});
