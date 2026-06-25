import Link from "next/link";
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-glass-border bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg italic text-mist">
          <Moon size={18} className="text-drift" strokeWidth={1.5} />
          DreamForge
        </Link>
        <nav className="hidden items-center gap-8 font-body text-sm text-mist-muted md:flex">
          <a href="#features" className="transition hover:text-mist">Features</a>
          <a href="#demo" className="transition hover:text-mist">Demo</a>
          <a href="#pricing" className="transition hover:text-mist">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden font-body text-sm text-mist-muted transition hover:text-mist sm:inline">
            Log in
          </Link>
          <Link href="/dreams/new">
            <Button className="!px-5 !py-2.5 text-sm">Start a dream</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
