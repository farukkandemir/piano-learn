import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const { auth } = context;
    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/login",
      });
    }
  },
});
