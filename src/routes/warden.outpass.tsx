import { createFileRoute } from "@tanstack/react-router";
import { OutpassPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/warden/outpass")({
  head: () => ({
    meta: [
      { title: "Outpass Requests — HMS Warden" },
      { name: "description", content: "Approve or reject student exit requests for your blocks." },
      { property: "og:title", content: "Outpass Requests — HMS Warden" },
      { property: "og:description", content: "Approve or reject student exit requests for your blocks." },
    ],
  }),
  component: () => <OutpassPage role="warden" />,
});
