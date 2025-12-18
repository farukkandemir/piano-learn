import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { RefreshCcw, Home, Music2 } from "lucide-react";
import { Layout } from "./Layout";

export function RouterErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <Layout>
      <div className="flex h-[calc(100vh-80px)] items-center justify-center px-6">
        <div className="w-full max-w-lg">
          {/* Visual Element */}
          <div className="mb-12 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-20 bg-destructive rounded-full" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50 ring-1 ring-border/20 shadow-xl">
                <Music2 className="h-10 w-10 text-muted-foreground/40" />
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive shadow-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-3xl font-semibold tracking-tight">
              A slight dissonance
            </h1>
            <p className="text-muted-foreground text-balanced leading-relaxed">
              We encountered an unexpected error while preparing your practice
              space. This could be a temporary glitch or a malformed sheet music
              file.
            </p>
          </div>

          {/* Technical Details (Minimalist) */}
          {error.message && (
            <div className="mb-10 px-6 py-4 rounded-xl bg-muted/30 border border-border/40 backdrop-blur-[2px]">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 font-medium">
                Technical Insight
              </p>
              <p className="text-sm font-mono text-muted-foreground/80 wrap-break-word leading-relaxed">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => {
                reset?.();
                router.invalidate();
              }}
              className="w-full sm:w-auto px-8 gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-[0.98]"
            >
              <RefreshCcw className="h-4 w-4" />
              Recalibrate
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.navigate({ to: "/" })}
              className="w-full sm:w-auto px-8 gap-2 text-muted-foreground hover:text-foreground transition-all active:scale-[0.98]"
            >
              <Home className="h-4 w-4" />
              Library
            </Button>
          </div>

          <p className="mt-12 text-center text-xs text-muted-foreground/40">
            If this persists, please try a different MusicXML file.
          </p>
        </div>
      </div>
    </Layout>
  );
}
