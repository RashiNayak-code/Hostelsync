import { createFileRoute } from "@tanstack/react-router";
import { MyRoomPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/student/room")({
  head: () => ({
    meta: [
      { title: "Room Allocation — HMS Student" },
      { name: "description", content: "Your allotted hostel room, block details and roommates." },
      { property: "og:title", content: "Room Allocation — HMS Student" },
      { property: "og:description", content: "Your allotted hostel room, block details and roommates." },
    ],
  }),
  component: () => <MyRoomPage />,
});
