import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/components/not-found";
import { AuthProvider } from "@/context/auth";

const queryClient = new QueryClient();
export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Toaster position="top-center" duration={3000} richColors />
        <div className="min-h-screen">
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  ),
  notFoundComponent: NotFound,
});
