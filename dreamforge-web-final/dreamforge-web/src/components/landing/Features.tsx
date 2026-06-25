"use client";

import { motion } from "framer-motion";
import { Network, LayoutGrid, ImageIcon, Clapperboard } from "lucide-react";

const FEATURES = [
  {
    icon: Network,
    title: "Scene graph extraction",
    description:
      "Characters, places, objects, and the emotion threading them together — mapped from your own words, not a template.",
  },
  {
    icon: LayoutGrid,
    title: "Automatic storyboarding",
    description:
      "Your scene graph becomes a sequence of shots, each with framing notes and a prompt you can edit before anything renders.",
  },
  {
    icon: ImageIcon,
    title: "Consistent image rendering",
    description:
      "Every panel shares a visual seed, so the lighthouse in shot one is still the lighthouse in shot four.",
  },
  {
    icon: Clapperboard,
    title: "Image-to-video assembly",
    description:
      "Panels are animated and stitched into a single cut, with transitions timed to the mood of the dream.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-glass-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <span className="eyebrow">What happens after you hit submit</span>
        <h2 className="mt-4 max-w-xl font-display text-3xl text-mist sm:text-4xl">
          One paragraph in. A four-stage pipeline does the rest.
        </h2>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass rounded-xl2 p-7 transition-colors hover:border-drift/30"
            >
              <feature.icon size={22} className="text-drift-soft" strokeWidth={1.5} />
              <h3 className="mt-5 font-display text-lg text-mist">{feature.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-mist-muted">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
