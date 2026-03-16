"use client";

import { Button } from "@/components/ui/button";

type HomeBannerProps = {
  onSubmitReceipt?: () => void;
};

export default function HomeBanner({ onSubmitReceipt }: HomeBannerProps) {
  return (
    <div className="flex items-center justify-center gap-4 px-6 py-2.5 text-sm border-b bg-home-banner border-cream-border text-ink-muted">
      <span>Prices submitted by real Costco Canada members.</span>
      <Button
        variant="outline"
        size="lg"
        className="rounded-full bg-transparent border-ink-muted text-ink-muted hover:bg-cream-border"
        onClick={onSubmitReceipt}
      >
        Submit a receipt
      </Button>
    </div>
  );
}
