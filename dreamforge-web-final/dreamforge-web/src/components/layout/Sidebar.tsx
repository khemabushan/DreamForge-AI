"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, LayoutDashboard, PlusCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dream history", icon: LayoutDashboard },
  { href: "/dreams/new", label: "New dream", icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-col border-r border-glass-border bg-ink-50/40 px-4 py-6 md:flex">
      <Link href="/" className="mb-10 flex items-center gap-2 px-2 font-display text-lg italic text-mist">
        <Moon size={18} className="text-drift" strokeWidth={1.5} />
        DreamForge
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition",
                active
                  ? "bg-drift/10 text-drift-soft"
                  : "text-mist-muted hover:bg-white/[0.03] hover:text-mist"
              )}
            >
              <item.icon size={16} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/settings"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-mist-muted transition hover:bg-white/[0.03] hover:text-mist"
      >
        <Settings size={16} strokeWidth={1.5} />
        Settings
      </Link>
    </aside>
  );
}
