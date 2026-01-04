import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { LogOut, Menu, Info, BookOpen, Map, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import type { User } from "@supabase/supabase-js";

interface LayoutProps {
  children: React.ReactNode;
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
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          )}
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

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  const { user, signOut } = useAuth();

  const navLinks = [
    { href: "/about", label: "About", icon: Info },
    { href: "/guide", label: "Guide", icon: BookOpen },
    { href: "/roadmap", label: "Roadmap", icon: Map },
  ];

  // Resolve system theme to actual dark/light
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const logoSrc = isDark
    ? "/logo-svgs/logo-white.svg"
    : "/logo-svgs/logo-dark.svg";

  return (
    <div className="min-h-screen bg-background bg-dot-grid">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity"
          >
            <img src={logoSrc} alt="piano.learn logo" className="h-7 w-7" />
            piano.learn
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-2">
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
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
            )}

            <ModeToggle />
          </div>

          {/* Mobile Nav */}
          <div className="flex md:hidden items-center gap-3">
            <ModeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Menu Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="right" className="w-72">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mt-6 mb-2">
                Navigate
              </p>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      to={link.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 text-sm rounded-md transition-colors",
                        location.pathname === link.href
                          ? "text-foreground font-medium bg-muted"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-border/40">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                    <SheetClose asChild>
                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </SheetClose>
                  </div>
                ) : (
                  <SheetClose asChild>
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-primary hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign in
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border/40 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link
                to="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                to="/guide"
                className="hover:text-foreground transition-colors"
              >
                Guide
              </Link>
              <Link
                to="/roadmap"
                className="hover:text-foreground transition-colors"
              >
                Roadmap
              </Link>
              <a
                href="https://twitter.com/farukkand09"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Twitter
              </a>
            </div>
            <p className="text-sm text-muted-foreground/60">
              Built by a beginner, for beginners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
