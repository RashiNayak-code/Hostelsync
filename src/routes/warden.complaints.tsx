import { createFileRoute } from "@tanstack/react-router";
import { ComplaintsPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/warden/complaints")({
  head: () => ({
    meta: [
      { title: "Complaints — HMS Warden" },
      { name: "description", content: "Update the status of complaints reported in your blocks." },
      { property: "og:title", content: "Complaints — HMS Warden" },
      { property: "og:description", content: "Update the status of complaints reported in your blocks." },
    ],
  }),
  component: () => <ComplaintsPage role="warden" />,
});
