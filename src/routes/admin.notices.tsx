import { createFileRoute } from "@tanstack/react-router";
import { NoticesPage } from "@/components/hms/pages/misc";

export const Route = createFileRoute("/admin/notices")({
  head: () => ({
    meta: [
      { title: "Notices — HMS Admin" },
      { name: "description", content: "Publish hostel announcements to students and wardens." },
      { property: "og:title", content: "Notices — HMS Admin" },
      { property: "og:description", content: "Publish hostel announcements to students and wardens." },
    ],
  }),
  component: () => <NoticesPage role="admin" />,
});
