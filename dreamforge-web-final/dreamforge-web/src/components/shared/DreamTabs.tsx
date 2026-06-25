"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function DreamTabs({ dreamId }: { dreamId: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/dreams/${dreamId}`, label: "Overview" },
    { href: `/dreams/${dreamId}/scene-graph`, label: "Scene graph" },
    { href: `/dreams/${dreamId}/storyboard`, label: "Storyboard" },
    { href: `/dreams/${dreamId}/video`, label: "Video" },
  ];

  return (
    <div className="flex gap-1 border-b border-glass-border px-6 md:px-10">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative px-4 py-3 font-body text-sm transition",
              active ? "text-mist" : "text-mist-muted hover:text-mist"
            )}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-drift" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
