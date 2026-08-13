import { createFileRoute } from "@tanstack/react-router";
import { RoomsPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/warden/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms — HMS Warden" },
      { name: "description", content: "Block-wise room occupancy and maintenance status." },
      { property: "og:title", content: "Rooms — HMS Warden" },
      { property: "og:description", content: "Block-wise room occupancy and maintenance status." },
    ],
  }),
  component: () => <RoomsPage role="warden" />,
});
