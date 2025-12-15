import GuidePage from "@/pages/GuidePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/guide")({
  component: GuidePage,
});
