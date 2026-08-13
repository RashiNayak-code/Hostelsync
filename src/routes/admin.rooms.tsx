import { createFileRoute } from "@tanstack/react-router";
import { RoomsPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/admin/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms — HMS Admin" },
      { name: "description", content: "Room inventory, bed allocation and maintenance tracking." },
      { property: "og:title", content: "Rooms — HMS Admin" },
      { property: "og:description", content: "Room inventory, bed allocation and maintenance tracking." },
    ],
  }),
  component: () => <RoomsPage role="admin" />,
});
