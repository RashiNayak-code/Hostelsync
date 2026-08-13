import { createFileRoute } from "@tanstack/react-router";
import { NoticesPage } from "@/components/hms/pages/misc";

export const Route = createFileRoute("/warden/notices")({
  head: () => ({
    meta: [
      { title: "Notices — HMS Warden" },
      { name: "description", content: "Hostel announcements published by the admin office." },
      { property: "og:title", content: "Notices — HMS Warden" },
      { property: "og:description", content: "Hostel announcements published by the admin office." },
    ],
  }),
  component: () => <NoticesPage role="warden" />,
});
