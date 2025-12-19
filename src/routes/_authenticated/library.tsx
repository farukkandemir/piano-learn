import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/library")({
  component: RouteComponent,
});

function RouteComponent() {
  console.log("library");
  return <div>Hello "/_authenticated/library"!</div>;
}
