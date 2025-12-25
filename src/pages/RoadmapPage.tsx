import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";

type FeatureStatus = "done" | "in-progress" | "planned";

interface Feature {
  name: string;
  description: string;
  status: FeatureStatus;
}

const STATUS_STYLES: Record<FeatureStatus, string> = {
  done: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  planned: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const STATUS_LABELS: Record<FeatureStatus, string> = {
  done: "Done",
  "in-progress": "In Progress",
  planned: "Planned",
};

const features: Feature[] = [
  {
    name: "Metronome",
    description: "A built-in metronome to help you keep time while practicing.",
    status: "done",
  },
  {
    name: "Section Looping",
    description:
      "Select a range of measures to loop, so you can focus on tricky passages.",
    status: "done",
  },
  {
    name: "Mobile Improvements",
    description:
      "Better layout and touch controls for practicing on tablets and phones.",
    status: "in-progress",
  },
];

export default function RoadmapPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-6 py-20">
        {/* Header */}
        <section className="mb-12 p-6 rounded-lg bg-secondary/30">
          <p className="text-primary mb-6 text-sm uppercase tracking-wider font-medium">
            What's next
          </p>
          <h1 className="text-xl font-medium leading-relaxed mb-6">
            Here's what I'm working on and{" "}
            <span className="text-primary">what's coming</span>.
          </h1>
          <p className="text-sm text-muted-foreground/80">
            If there's something you'd love to see, let me know!
          </p>
        </section>

        {/* Feature List */}
        <section className="mb-16">
          <h2 className="text-sm uppercase tracking-wider text-primary mb-8 font-medium">
            Upcoming Features
          </h2>
          <div className="space-y-6">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="border-l-2 border-primary/50 pl-6 py-2"
              >
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-medium">{feature.name}</p>
                  <Badge className={STATUS_STYLES[feature.status]}>
                    {STATUS_LABELS[feature.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 rounded-lg bg-accent/30">
          <h2 className="text-sm uppercase tracking-wider text-primary mb-6 font-medium">
            Got feedback?
          </h2>
          <p className="leading-relaxed">
            Found a bug or have a feature idea? Let me know on{" "}
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
      </div>
    </Layout>
  );
}
