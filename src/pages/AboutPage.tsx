import { Layout } from "@/components/Layout";

export default function AboutPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-6 py-20">
        {/* Personal intro */}
        <section className="mb-20">
          <p className="text-muted-foreground mb-6 text-sm uppercase tracking-wider">
            Why this exists
          </p>
          <h1 className="text-xl font-medium leading-relaxed mb-6">
            I started learning piano a few months ago. Like most beginners, I
            wanted a simple way to practice with sheet music—something that
            would wait for me, not rush me.
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Most apps out there are expensive, cluttered, or locked behind
            subscriptions. So I built this instead. It's free, it's simple, and
            it works.
          </p>
        </section>

        {/* How it works - text only, clean */}
        <section className="mb-20">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-8">
            How it works
          </h2>
          <div className="space-y-6">
            <div className="border-l-2 border-border pl-6">
              <p className="font-medium mb-1">Upload any MusicXML file</p>
              <p className="text-sm text-muted-foreground">
                Grab sheets from MuseScore, IMSLP, or wherever you find them.
              </p>
            </div>
            <div className="border-l-2 border-border pl-6">
              <p className="font-medium mb-1">Connect your keyboard</p>
              <p className="text-sm text-muted-foreground">
                Plug in via USB (or Bluetooth on Mac/iOS) and you're ready.
              </p>
            </div>
            <div className="border-l-2 border-border pl-6">
              <p className="font-medium mb-1">Practice at your pace</p>
              <p className="text-sm text-muted-foreground">
                The app waits for you to play the right notes before moving on.
              </p>
            </div>
          </div>
        </section>

        {/* Community vision */}
        <section className="mb-20">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-8">
            The bigger picture
          </h2>
          <p className="leading-relaxed mb-4">
            Right now, this is a practice tool. But I'd love it to become
            something more—a place where learners share sheets, tips, and
            progress with each other.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            No pressure, no levels, no gamification. Just people learning piano
            together.
          </p>
        </section>

        {/* Closing */}
        <section className="pt-8 border-t border-border/60">
          <p className="text-sm text-muted-foreground">
            Built by a beginner, for beginners (and anyone else who wants a
            simple practice tool).
          </p>
        </section>
      </div>
    </Layout>
  );
}
