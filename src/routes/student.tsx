import { createFileRoute } from "@tanstack/react-router";
import { RoleLayout } from "@/components/hms/RoleLayout";

export const Route = createFileRoute("/student")({
  component: () => <RoleLayout role="student" />,
});
