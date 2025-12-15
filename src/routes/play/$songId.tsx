import PlayPage from "@/pages/PlayPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/play/$songId")({
  component: PlayPage,
});
