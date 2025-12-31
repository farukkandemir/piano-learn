import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";

type FeatureStatus = "done" | "in-progress" | "planned";

interface ChangelogEntry {
  date: string;
  items: string[];
}

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

// Changelog entries - newest first
const changelog: ChangelogEntry[] = [
  {
    date: "December 30, 2024",
    items: [
      "Sheet music now stays in place when playing notes after scrolling",
      "Improved mobile and tablet layouts",
    ],
  },
  {
    date: "December 27, 2024",
    items: [
      "Loop any section of the music to practice tricky passages",
      "Built-in metronome to help keep time",
    ],
  },
  {
    date: "December 21, 2024",
    items: ["Initial public launch 🎉"],
  },
];

// Upcoming features
const upcomingFeatures: Feature[] = [
  {
    name: "Audio Playback for Songs",
    description:
      "Listen to any song before you practice, hear how it should sound at full tempo.",
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
            Updates
          </p>
          <h1 className="text-xl font-medium leading-relaxed mb-6">
            What's <span className="text-primary">new</span> and what's coming.
          </h1>
          <p className="text-sm text-muted-foreground/80">
            Follow along as I build. Got ideas? Let me know!
          </p>
        </section>

        {/* Changelog */}
        <section className="mb-16">
          <h2 className="text-sm uppercase tracking-wider text-primary mb-8 font-medium">
            Recent Updates
          </h2>
          <div className="space-y-8">
            {changelog.map((entry) => (
              <div key={entry.date} className="relative pl-6">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-primary" />
                {/* Timeline line */}
                <div className="absolute left-[3px] top-4 bottom-0 w-0.5 bg-primary/20" />

                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {entry.date}
                </p>
                <ul className="space-y-1">
                  {entry.items.map((item, i) => (
                    <li key={i} className="text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Features */}
        <section className="mb-16">
          <h2 className="text-sm uppercase tracking-wider text-primary mb-8 font-medium">
            What's Next
          </h2>
          <div className="space-y-6">
            {upcomingFeatures.map((feature) => (
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
