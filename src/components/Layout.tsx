import { Link, useLocation } from "@tanstack/react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { LogOut, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@supabase/supabase-js";

interface LayoutProps {
  children: React.ReactNode;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

const UserProfile = ({
  user,
  signOut,
}: {
  user: User;
  signOut: () => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="ml-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <div className="h-9 w-9 rounded-sm bg-muted flex items-center justify-center text-xs font-medium">
            {user.email?.charAt(0).toUpperCase()}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal truncate">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-sm cursor-pointer">
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function Layout({
  children,
  showSearch = false,
  searchQuery = "",
  onSearchChange,
}: LayoutProps) {
  const location = useLocation();

  const { user, signOut } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/guide", label: "Guide" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="text-lg font-bold hover:opacity-80 transition-opacity"
          >
            piano.learn
          </Link>

          {showSearch && onSearchChange && (
            <div className="relative max-w-xs flex-1 mx-8">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                type="text"
                placeholder="Search songs..."
                className="h-9 w-full rounded-lg border-0 bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus:bg-muted focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-1">
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors",
                    location.pathname === link.href
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {user ? (
              <UserProfile user={user} signOut={signOut} />
            ) : (
              <Link
                to="/login"
                className="ml-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
            )}

            <ModeToggle />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
