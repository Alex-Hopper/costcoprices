"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomeBanner() {
  return (
    <div className="flex items-center justify-center gap-4 px-6 py-2.5 text-sm border-b bg-home-banner border-cream-border text-ink-muted">
      <span>Prices submitted by real Costco Canada members.</span>
      <Link href="/submit">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full bg-transparent border-ink-muted text-ink-muted hover:bg-cream-border"
        >
          Submit a receipt
        </Button>
      </Link>
    </div>
  );
}
