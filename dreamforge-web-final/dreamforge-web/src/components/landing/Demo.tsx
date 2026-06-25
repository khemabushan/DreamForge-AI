"use client";

import { motion } from "framer-motion";
import { FileText, Network, LayoutGrid, ImageIcon, Clapperboard, Check } from "lucide-react";

const STEPS = [
  { icon: FileText, label: "Dream text", detail: "\u201CA glass lighthouse that kept changing color\u2026\u201D" },
  { icon: Network, label: "Scene graph", detail: "5 nodes, 5 relationships extracted" },
  { icon: LayoutGrid, label: "Storyboard", detail: "4 panels, framing + prompts drafted" },
  { icon: ImageIcon, label: "Images", detail: "Rendered with a shared visual seed" },
  { icon: Clapperboard, label: "Video", detail: "Stitched into a 22-second cut" },
];

export function Demo() {
  return (
    <section id="demo" className="border-t border-glass-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <span className="eyebrow">From paragraph to playback</span>
        <h2 className="mt-4 max-w-xl font-display text-3xl text-mist sm:text-4xl">
          The same dream, five stages later
        </h2>

        <div className="mt-14 overflow-x-auto">
          <div className="flex min-w-[820px] items-stretch gap-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative flex-1"
              >
                <div className="glass flex h-full flex-col rounded-xl2 p-5">
                  <div className="flex items-center justify-between">
                    <step.icon size={18} className="text-drift-soft" strokeWidth={1.5} />
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                      <Check size={12} />
                    </span>
                  </div>
                  <span className="mt-4 font-mono text-[10px] uppercase tracking-wider text-mist-faint">
                    Stage {i + 1}
                  </span>
                  <h4 className="mt-1 font-display text-base text-mist">{step.label}</h4>
                  <p className="mt-2 font-body text-xs leading-relaxed text-mist-muted">
                    {step.detail}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="absolute right-[-14px] top-1/2 hidden h-px w-6 -translate-y-1/2 bg-glass-border md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
