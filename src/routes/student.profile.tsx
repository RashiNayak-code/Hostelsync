import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/hms/pages/misc";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — HMS Student" },
      { name: "description", content: "Your hostel record, guardian details and contact information." },
      { property: "og:title", content: "My Profile — HMS Student" },
      { property: "og:description", content: "Your hostel record, guardian details and contact information." },
    ],
  }),
  component: () => <ProfilePage />,
});
