import {
  createRootRoute,
  createRootRouteWithContext,
  Outlet,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/components/not-found";
import { RouterErrorComponent } from "@/components/RouterErrorComponent";
import { type AuthContextType } from "@/context/auth";

interface RouterContext {
  auth: AuthContextType;
}

const queryClient = new QueryClient();
export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Toaster position="top-center" duration={3000} richColors />
        <div className="min-h-screen">
          <Outlet />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  ),
  notFoundComponent: NotFound,
  errorComponent: RouterErrorComponent,
});
