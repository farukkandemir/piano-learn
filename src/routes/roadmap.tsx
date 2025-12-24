import RoadmapPage from "@/pages/RoadmapPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/roadmap")({
  component: RoadmapPage,
});
