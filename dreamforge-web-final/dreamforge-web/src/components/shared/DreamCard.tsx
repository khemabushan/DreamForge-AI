import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Dream } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function DreamCard({ dream }: { dream: Dream }) {
  return (
    <Link href={`/dreams/${dream.id}`}>
      <Card className="group transition-colors hover:border-drift/30">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg text-mist">{dream.title}</h3>
          <ArrowUpRight
            size={16}
            className="mt-1 shrink-0 text-mist-faint transition group-hover:text-drift-soft"
          />
        </div>
        <p className="mt-2 line-clamp-2 font-body text-sm text-mist-muted">
          {dream.rawText}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <StatusBadge status={dream.status} />
          <span className="font-mono text-xs text-mist-faint">
            {formatDate(dream.createdAt)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
