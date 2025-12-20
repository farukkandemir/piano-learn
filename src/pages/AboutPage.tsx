import { Layout } from "@/components/Layout";

export default function AboutPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-6 py-20">
        {/* Personal intro - with subtle card background */}
        <section className="mb-20 p-6 rounded-lg bg-secondary/30">
          <p className="text-primary mb-6 text-sm uppercase tracking-wider font-medium">
            Why this exists
          </p>
          <h1 className="text-xl font-medium leading-relaxed mb-6">
            I started learning piano a few months ago. Like most beginners, I
            wanted a simple way to practice with sheet music. Something that
            would <span className="text-primary">wait for me</span>, not rush
            me.
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Most apps out there are expensive, cluttered, or locked behind
            subscriptions. So I built this instead. It's{" "}
            <span className="font-medium text-foreground">free</span>, it's{" "}
            <span className="font-medium text-foreground">simple</span>, and it{" "}
            <span className="font-medium text-foreground">works</span>.
          </p>
        </section>

        {/* How it works - colored left border */}
        <section className="mb-20">
          <h2 className="text-sm uppercase tracking-wider text-primary mb-8 font-medium">
            How it works
          </h2>
          <div className="space-y-6">
            <div className="border-l-2 border-primary/50 pl-6">
              <p className="font-medium mb-1">Upload any MusicXML file</p>
              <p className="text-sm text-muted-foreground">
                Grab sheets from MuseScore, IMSLP, or wherever you find them.
              </p>
            </div>
            <div className="border-l-2 border-primary/50 pl-6">
              <p className="font-medium mb-1">Connect your keyboard</p>
              <p className="text-sm text-muted-foreground">
                Plug in via USB (or Bluetooth on Mac/iOS) and you're ready.
              </p>
            </div>
            <div className="border-l-2 border-primary/50 pl-6">
              <p className="font-medium mb-1">Practice at your pace</p>
              <p className="text-sm text-muted-foreground">
                The app waits for you to play the right notes before moving on.
              </p>
            </div>
          </div>
        </section>

        {/* Community vision */}
        <section className="mb-20">
          <h2 className="text-sm uppercase tracking-wider text-primary mb-8 font-medium">
            The bigger picture
          </h2>
          <p className="leading-relaxed mb-4">
            Right now, this is a practice tool. But I'd love it to become
            something more — a place where learners{" "}
            <span className="text-primary">share sheets</span>,{" "}
            <span className="text-primary">tips</span>, and{" "}
            <span className="text-primary">progress</span> with each other.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            No pressure, no levels. Just people learning piano together.
          </p>
        </section>

        {/* Community ask - subtle card */}
        <section className="mb-20 p-6 rounded-lg bg-accent/30">
          <h2 className="text-sm uppercase tracking-wider text-primary mb-6 font-medium">
            A small ask
          </h2>
          <p className="leading-relaxed mb-4">
            When you upload sheets, please use accurate titles and composer
            names. It helps everyone find what they're looking for.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            And let's keep things respectful. No spam, no copyrighted content
            you don't have rights to share. Just music we can all enjoy
            learning.
          </p>
        </section>

        {/* Get in touch */}
        <section className="mb-20">
          <h2 className="text-sm uppercase tracking-wider text-primary mb-8 font-medium">
            Say hi
          </h2>
          <p className="leading-relaxed">
            Got feedback, ideas, or just want to chat about piano stuff? Find me
            on{" "}
            <a
              href="https://twitter.com/farukkand09"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-colors font-medium"
            >
              Twitter
            </a>
            .
          </p>
        </section>

        {/* Closing */}
        <section className="pt-8 border-t border-primary/20">
          <p className="text-sm text-muted-foreground">
            Built by a beginner, for beginners (and anyone else who wants a
            simple practice tool).
          </p>
        </section>
      </div>
    </Layout>
  );
}
