import { Layout } from "@/components/Layout";

interface PlatformProps {
  name: string;
  connection: string;
  steps: string[];
  note: string;
}

function Platform({ name, connection, steps, note }: PlatformProps) {
  return (
    <div className="py-8 border-b border-primary/20 last:border-0">
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="font-medium">{name}</h3>
        <span className="text-sm text-primary/70 font-medium">
          {connection}
        </span>
      </div>

      <ol className="space-y-3 mb-6">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-4 text-sm">
            <span className="text-primary/50 tabular-nums font-medium">
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
      "Open the app in Chrome or Edge and go to the play page.",
      "Your keyboard should appear automatically.",
    ],
    note: "Bluetooth MIDI requires experimental browser flags on Windows. USB is the reliable choice.",
  },
  {
    name: "macOS",
    connection: "USB or Bluetooth",
    steps: [
      "For USB: Just plug in your keyboard.",
      "For Bluetooth: Open Audio MIDI Setup → Show MIDI Studio → Bluetooth.",
      "Pair your keyboard and open the app in Chrome or Safari.",
    ],
    note: "macOS has native MIDI support for both wired and wireless connections.",
  },
  {
    name: "iOS / iPadOS",
    connection: "USB cable + special browser",
    steps: [
      "Download the 'Web MIDI Browser' app from the App Store.",
      "Connect your keyboard via USB (with a Lightning or USB-C adapter).",
      "Open this app's URL in the Web MIDI Browser, not Safari.",
    ],
    note: "Safari doesn't support Web MIDI. The Web MIDI Browser app is currently the only workaround on iOS.",
  },
];

export default function GuidePage() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-6 py-20">
        {/* Header - with subtle card background */}
        <section className="mb-12 p-6 rounded-lg bg-secondary/30">
          <p className="text-primary mb-6 text-sm uppercase tracking-wider font-medium">
            Getting started
          </p>
          <h1 className="text-xl font-medium leading-relaxed mb-6">
            Connect your MIDI keyboard and start practicing in{" "}
            <span className="text-primary">a few minutes</span>.
          </h1>
          <p className="text-sm text-muted-foreground/80">
            Honestly, MIDI in browsers is a bit of a mess depending on your
            device. I've tried to figure out what actually works but if you've
            cracked a better setup, please let me know!
          </p>
        </section>

        {/* Platforms */}
        <section className="mb-16">
          {platforms.map((platform) => (
            <Platform key={platform.name} {...platform} />
          ))}
        </section>

        {/* Troubleshooting - styled card */}
        <section className="p-6 rounded-lg bg-accent/30">
          <h2 className="text-sm uppercase tracking-wider text-primary mb-8 font-medium">
            Common issues
          </h2>
          <div className="space-y-6 text-sm">
            <div className="border-l-2 border-primary/50 pl-4">
              <p className="font-medium mb-1">Keyboard not showing up?</p>
              <p className="text-muted-foreground">
                Refresh the page or try a different USB port. Make sure no other
                app is using the MIDI device.
              </p>
            </div>
            <div className="border-l-2 border-primary/50 pl-4">
              <p className="font-medium mb-1">Laggy response?</p>
              <p className="text-muted-foreground">
                Wired connections are faster. Close other browser tabs to free
                up resources.
              </p>
            </div>
            <div className="border-l-2 border-primary/50 pl-4">
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
