"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCreateDream } from "@/hooks/useDreams";
import { ApiError } from "@/lib/api";

const MOODS = ["Calm", "Uneasy", "Vivid", "Recurring", "Nightmare"];
const STYLES = ["Cinematic", "Watercolor", "Anime", "Noir", "Surreal photo"];

export default function NewDreamPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [mood, setMood] = useState(MOODS[1]);
  const [style, setStyle] = useState(STYLES[0]);
  const createDream = useCreateDream();

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  function handleSubmit() {
    if (!text.trim()) return;
    createDream.mutate(
      { rawText: text, mood, style },
      {
        onSuccess: (dream) => router.push(`/dreams/${dream.id}`),
      },
    );
  }

  return (
    <>
      <Topbar
        title="Describe a dream"
        subtitle="Write it the way you remember it — fragments are fine."
      />

      <div className="mx-auto max-w-3xl px-6 py-8 md:px-10">
        <Card>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="I was standing on a beach made of dark sand, and a lighthouse made entirely of glass kept changing color..."
            rows={8}
            className="w-full resize-none bg-transparent font-body text-base text-mist placeholder:text-mist-faint focus:outline-none"
          />
          <div className="mt-3 flex items-center justify-between font-mono text-xs text-mist-faint">
            <span>{wordCount} words</span>
            <span>Minimum 15 words for a useful scene graph</span>
          </div>
        </Card>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <span className="eyebrow">Mood</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 font-body text-sm transition",
                    mood === m
                      ? "border-drift/50 bg-drift/15 text-drift-soft"
                      : "border-glass-border text-mist-muted hover:border-white/20"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="eyebrow">Visual style</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 font-body text-sm transition",
                    style === s
                      ? "border-wake/50 bg-wake/15 text-wake-soft"
                      : "border-glass-border text-mist-muted hover:border-white/20"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex items-center justify-between gap-4"
        >
          <p className="font-body text-sm text-mist-faint">
            {createDream.isError ? (
              <span className="text-red-300">
                {createDream.error instanceof ApiError
                  ? createDream.error.message
                  : "Something went wrong submitting this dream."}
              </span>
            ) : (
              "This kicks off a five-stage pipeline. You can edit the scene graph and storyboard before anything renders."
            )}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || createDream.isPending}
            className="shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wand2 size={16} className={createDream.isPending ? "animate-spin" : ""} />
            {createDream.isPending ? "Sending to pipeline\u2026" : "Generate"}
          </Button>
        </motion.div>
      </div>
    </>
  );
}
