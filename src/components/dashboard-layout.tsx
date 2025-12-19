import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Library, Settings, Home } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarLinks = [
  { href: "/library", label: "Library", icon: Library },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r border-border/40 min-h-screen sticky top-0">
          <div className="flex flex-col h-full px-4 py-6">
            {/* Logo / Back to main site */}
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 px-2"
            >
              <Home className="h-4 w-4" />
              <span>piano.learn</span>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
                      isActive
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="pt-4 border-t border-border/40">
              <ModeToggle />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
