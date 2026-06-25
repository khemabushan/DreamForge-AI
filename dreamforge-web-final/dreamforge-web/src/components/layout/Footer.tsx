import Link from "next/link";
import { Moon, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-glass-border py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display text-lg italic text-mist">
            <Moon size={18} className="text-drift" strokeWidth={1.5} />
            DreamForge
          </Link>
          <p className="mt-3 max-w-xs font-body text-sm text-mist-muted">
            Dreams, mapped and rendered. Built as a demonstration of an
            end-to-end generative pipeline.
          </p>
        </div>

        <div className="flex gap-12 font-body text-sm text-mist-muted">
          <div className="flex flex-col gap-2">
            <span className="eyebrow mb-1">Product</span>
            <a href="#features" className="transition hover:text-mist">Features</a>
            <a href="#demo" className="transition hover:text-mist">Demo</a>
            <a href="#pricing" className="transition hover:text-mist">Pricing</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="eyebrow mb-1">Connect</span>
            <a href="#" className="flex items-center gap-2 transition hover:text-mist">
              <Github size={14} /> GitHub
            </a>
            <a href="#" className="flex items-center gap-2 transition hover:text-mist">
              <Twitter size={14} /> Twitter
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl px-6 font-mono text-xs text-mist-faint">
        © {new Date().getFullYear()} DreamForge AI — a portfolio project.
      </div>
    </footer>
  );
}
