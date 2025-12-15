import { Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-6 py-20">
        <section>
          <p className="text-muted-foreground mb-6 text-sm uppercase tracking-wider">
            404
          </p>
          <h1 className="text-xl font-medium leading-relaxed mb-6">
            This page doesn't exist. Maybe it was moved, or maybe it never did.
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Let's get you back on track.
          </p>
          <Link
            to="/"
            className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Back to home
          </Link>
        </section>
      </div>
    </Layout>
  );
}
