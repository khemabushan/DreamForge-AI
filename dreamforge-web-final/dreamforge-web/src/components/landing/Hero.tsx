"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConstellationField } from "@/components/shared/ConstellationField";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-dream-gradient">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-20 md:grid-cols-2 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="eyebrow mb-6 inline-flex items-center gap-2">
            <Sparkles size={12} /> Dream to film, in minutes
          </span>
          <h1 className="font-display text-4xl leading-[1.1] text-mist sm:text-5xl md:text-6xl">
            Write down a dream.{" "}
            <span className="italic text-drift-soft">Watch it</span> become a film.
          </h1>
          <p className="mt-6 max-w-md font-body text-base text-mist-muted">
            DreamForge AI reads what you remember, maps it into a scene graph,
            storyboards the sequence, and renders it into images and video —
            so the dream that slipped away by breakfast doesn&apos;t have to.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/dreams/new">
              <Button>
                Describe a dream <ArrowRight size={16} />
              </Button>
            </Link>
            <a href="#demo">
              <Button variant="ghost">See it work</Button>
            </a>
          </div>
          <div className="mt-10 flex items-center gap-6 font-mono text-xs text-mist-faint">
            <span>NO CREDIT CARD</span>
            <span className="h-1 w-1 rounded-full bg-mist-faint" />
            <span>3 FREE DREAMS / MONTH</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
          className="relative h-[360px] md:h-[420px]"
        >
          <div className="glass-strong absolute inset-0 rounded-xl2 shadow-glass">
            <ConstellationField className="h-full w-full" dense />
          </div>
          <div className="absolute -bottom-4 -left-4 glass rounded-xl px-4 py-3 font-mono text-[11px] text-drift-soft shadow-glass">
            scene_graph.nodes → 5
          </div>
          <div className="absolute -right-3 -top-3 glass rounded-xl px-4 py-3 font-mono text-[11px] text-wake-soft shadow-glass">
            render: 64%
          </div>
        </motion.div>
      </div>
    </section>
  );
}
