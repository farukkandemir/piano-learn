import { Layout } from "@/components/Layout";

interface PlatformProps {
  name: string;
  connection: string;
  steps: string[];
  note: string;
}

function Platform({ name, connection, steps, note }: PlatformProps) {
  return (
    <div className="py-8 border-b border-border/60 last:border-0">
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="font-medium">{name}</h3>
        <span className="text-sm text-muted-foreground">{connection}</span>
      </div>

      <ol className="space-y-3 mb-6">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-4 text-sm">
            <span className="text-muted-foreground/60 tabular-nums">
              {index + 1}.
            </span>
            <span className="text-muted-foreground">{step}</span>
          </li>
        ))}
      </ol>

      <p className="text-sm text-muted-foreground/80 italic">{note}</p>
    </div>
  );
}

const platforms: PlatformProps[] = [
  {
    name: "Windows",
    connection: "USB cable",
    steps: [
      "Connect your MIDI keyboard to your computer with a USB cable.",
      "Open the app and go to the play page.",
      "Your keyboard should appear automatically.",
    ],
    note: "Bluetooth MIDI isn't supported on Windows browsers—you'll need a cable.",
  },
  {
    name: "macOS",
    connection: "USB or Bluetooth",
    steps: [
      "For USB: Just plug in your keyboard.",
      "For Bluetooth: Open Audio MIDI Setup → Show MIDI Studio → Bluetooth.",
      "Pair your keyboard and open the app.",
    ],
    note: "macOS has native MIDI support for both wired and wireless connections.",
  },
  {
    name: "iOS / iPadOS",
    connection: "Bluetooth",
    steps: [
      "Put your keyboard in Bluetooth pairing mode.",
      "Go to Settings → Bluetooth and connect.",
      "Open Safari and start playing.",
    ],
    note: "No cable needed—iOS handles Bluetooth MIDI natively.",
  },
];

export default function GuidePage() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-6 py-20">
        {/* Header */}
        <section className="mb-12">
          <p className="text-muted-foreground mb-6 text-sm uppercase tracking-wider">
            Getting started
          </p>
          <h1 className="text-xl font-medium leading-relaxed">
            Connect your MIDI keyboard and start practicing in a few minutes.
          </h1>
        </section>

        {/* Platforms */}
        <section className="mb-16">
          {platforms.map((platform) => (
            <Platform key={platform.name} {...platform} />
          ))}
        </section>

        {/* Troubleshooting */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-8">
            Common issues
          </h2>
          <div className="space-y-6 text-sm">
            <div>
              <p className="font-medium mb-1">Keyboard not showing up?</p>
              <p className="text-muted-foreground">
                Refresh the page or try a different USB port. Make sure no other
                app is using the MIDI device.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Laggy response?</p>
              <p className="text-muted-foreground">
                Wired connections are faster. Close other browser tabs to free
                up resources.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Which browser works best?</p>
              <p className="text-muted-foreground">
                Chrome and Edge have the best Web MIDI support. Safari is more
                limited.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
