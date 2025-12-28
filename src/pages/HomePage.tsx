import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ArrowRight, Library } from "lucide-react";
import { useCommunitySongs } from "@/queries/songs";
import type { Song } from "@/types/song";
import { useAuth } from "@/context/auth";

import { SongCard, SongCardSkeleton } from "@/components/song-card";

// Testimonials data - real feedback from Reddit
const testimonials = [
  { quote: "Simple interface, clean look", author: "keeklo", source: "Reddit" },
  { quote: "Section looping is intuitive", author: "keeklo", source: "Reddit" },
  {
    quote: "This is what I need!",
    author: "Ok-Confusion3683",
    source: "Reddit",
  },
  { quote: "Works well on my iPad", author: "keeklo", source: "Reddit" },
];

function TestimonialsBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <div className="mb-10 flex flex-col items-center gap-3">
      {/* Glassmorphism pill */}
      <motion.div
        className="relative group"
        layout
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Glow effect */}
        <motion.div
          layout
          className="absolute -inset-1 bg-primary/20 rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity"
        />

        {/* Main pill */}
        <motion.div
          layout
          className="relative px-5 py-2.5 rounded-full bg-card/60 backdrop-blur-md border border-primary/20 shadow-lg"
        >
          <div className="flex items-center gap-2.5">
            {/* Star icon */}
            <span className="text-primary text-sm">★</span>

            {/* Quote with Framer Motion animation */}
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-xs whitespace-nowrap"
              >
                <span className="text-primary/60 font-serif">"</span>
                <span className="text-foreground/85">{current.quote}</span>
                <span className="text-primary/60 font-serif">"</span>
                <span className="text-muted-foreground/70 ml-2">
                  — {current.author}
                </span>
                <span className="text-muted-foreground/40 ml-1.5 text-[10px]">
                  via {current.source}
                </span>
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Indicator dots */}
      <div className="flex items-center gap-1.5">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-primary w-4"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-1.5"
            }`}
            aria-label={`View testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="mb-10 text-center">
      {/* Rotating testimonials banner */}
      <TestimonialsBanner />

      {/* Main Tagline */}
      <h1 className="mb-4 text-4xl md:text-5xl font-semibold tracking-tight">
        Learn what you want,
        <br />
        <span className="text-primary">not what we picked</span>.
      </h1>
      <p className="text-muted-foreground max-w-lg mx-auto text-lg">
        Import your sheet music and practice with visual guides.
      </p>
    </section>
  );
}

function StatsBadges() {
  return (
    <div className="flex flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
      <span>
        <span className="text-primary">✦</span> Free forever
      </span>
      <span className="text-primary">·</span>
      <span>Any sheet music</span>
      <span className="text-primary">·</span>
      <span>MIDI ready</span>
    </div>
  );
}

function HeroCta({
  onClick,
  isAuthenticated,
}: {
  onClick: () => void;
  isAuthenticated: boolean;
}) {
  if (!isAuthenticated) {
    return (
      <section className="mb-10 flex justify-center gap-4">
        <Button asChild size="lg">
          <Link to="/login">
            <Upload className="h-4 w-4" />
            Let's Play
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/about">Learn More</Link>
        </Button>
      </section>
    );
  }
  return (
    <section className="mb-10 flex justify-center">
      <Button onClick={onClick} size="lg">
        <Library className="h-4 w-4" />
        My Library
        <ArrowRight className="h-4 w-4 opacity-60" />
      </Button>
    </section>
  );
}

function Divider() {
  return (
    <section className="pb-12">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground">
            or explore community favorites
          </span>
        </div>
      </div>
    </section>
  );
}

function CommunitySection({
  songs,
  isLoading,
}: {
  songs: Song[] | undefined;
  isLoading: boolean;
}) {
  return (
    <section className="mt-[5%]">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Community Favorites</h2>
        <Button
          variant="link"
          size="sm"
          className="text-muted-foreground cursor-pointer"
        >
          Explore more
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <SongCardSkeleton key={index} />
            ))
          : songs?.map((song) => <SongCard key={song.id} song={song} />)}
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const { data: communitySongs, isLoading } = useCommunitySongs();

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-6 py-12 mt-[10%]">
        <HeroSection />

        <HeroCta
          onClick={() => navigate({ to: "/library" })}
          isAuthenticated={isAuthenticated}
        />

        <div className="mb-12">
          <StatsBadges />
        </div>

        <Divider />

        <CommunitySection songs={communitySongs} isLoading={isLoading} />
      </div>
    </Layout>
  );
}
