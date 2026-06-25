"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Dreamer",
    price: "Free",
    cadence: "",
    description: "For remembering the occasional dream before it fades.",
    features: ["3 dreams / month", "Scene graph + storyboard", "Standard image rendering"],
    featured: false,
  },
  {
    name: "Lucid",
    price: "$19",
    cadence: "/month",
    description: "For people who dream often and want the full cut.",
    features: [
      "Unlimited dreams",
      "Priority rendering queue",
      "Video assembly + export",
      "Style presets",
    ],
    featured: true,
  },
  {
    name: "Studio",
    price: "$79",
    cadence: "/month",
    description: "For teams using dreams as raw creative material.",
    features: [
      "Everything in Lucid",
      "Team workspaces",
      "API access",
      "Custom model providers",
    ],
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-glass-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <span className="eyebrow">Pricing</span>
        <h2 className="mt-4 max-w-xl font-display text-3xl text-mist sm:text-4xl">
          Start free. Stay if it&apos;s useful.
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={cn(
                "relative flex flex-col rounded-xl2 p-7",
                plan.featured
                  ? "glass-strong border-drift/40 shadow-glow"
                  : "glass"
              )}
            >
              {plan.featured && (
                <span className="eyebrow absolute -top-3 left-7 rounded-full bg-ink px-2 py-1">
                  Most chosen
                </span>
              )}
              <h3 className="font-display text-xl text-mist">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-3xl text-mist">{plan.price}</span>
                <span className="font-body text-sm text-mist-muted">{plan.cadence}</span>
              </div>
              <p className="mt-3 font-body text-sm text-mist-muted">{plan.description}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 font-body text-sm text-mist">
                    <Check size={15} className="mt-0.5 shrink-0 text-drift-soft" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.featured ? "primary" : "ghost"}
                className="mt-8 w-full"
              >
                {plan.price === "Free" ? "Start free" : `Choose ${plan.name}`}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
