"use client";

import Link from "next/link";
import { Loader2, PlusCircle, RefreshCw } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { DreamCard } from "@/components/shared/DreamCard";
import { useDreams } from "@/hooks/useDreams";

export default function DashboardPage() {
  const { data: dreams, isLoading, isError, error, refetch, isFetching } = useDreams();

  return (
    <>
      <Topbar
        title="Dream history"
        subtitle="Everything you've described, mapped and rendered."
        action={
          <Link href="/dreams/new">
            <Button className="!px-5 !py-2.5 text-sm">
              <PlusCircle size={15} /> New dream
            </Button>
          </Link>
        }
      />

      <div className="px-6 py-8 md:px-10">
        {isLoading ? (
          <div className="glass flex flex-col items-center gap-3 rounded-xl2 px-6 py-20 text-center">
            <Loader2 size={22} className="animate-spin text-drift-soft" />
            <p className="font-body text-sm text-mist-muted">Loading your dreams…</p>
          </div>
        ) : isError ? (
          <div className="glass flex flex-col items-center gap-3 rounded-xl2 px-6 py-20 text-center">
            <h3 className="font-display text-xl text-mist">Couldn&apos;t load your dreams</h3>
            <p className="max-w-sm font-body text-sm text-mist-muted">
              {error instanceof Error ? error.message : "Something went wrong talking to the API."}
            </p>
            <Button variant="ghost" onClick={() => refetch()} className="mt-2">
              <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> Try again
            </Button>
          </div>
        ) : dreams && dreams.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dreams.map((dream) => (
              <DreamCard key={dream.id} dream={dream} />
            ))}
          </div>
        ) : (
          <div className="glass flex flex-col items-center rounded-xl2 px-6 py-20 text-center">
            <h3 className="font-display text-xl text-mist">No dreams yet</h3>
            <p className="mt-2 max-w-sm font-body text-sm text-mist-muted">
              Write down what you remember, even in fragments. DreamForge
              fills in the structure.
            </p>
            <Link href="/dreams/new" className="mt-6">
              <Button>Describe your first dream</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
