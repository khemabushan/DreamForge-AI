import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" subtitle="Account, billing, and provider preferences." />
      <div className="mx-auto max-w-2xl px-6 py-8 md:px-10">
        <Card>
          <h3 className="font-display text-base text-mist">AI providers</h3>
          <p className="mt-2 font-body text-sm text-mist-muted">
            DreamForge is provider-agnostic. Swap LLM, image, and video
            backends without changing how dreams are submitted.
          </p>
        </Card>
      </div>
    </>
  );
}
