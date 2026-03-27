"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomeNav() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-home-nav">
      <Link
        href="/"
        className="text-[17px] border border-ink rounded-full px-4 py-1.5 tracking-tight font-serif text-ink"
      >
        Costco<em>Price</em>
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/search/*">
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-ink text-ink hover:bg-home-nav-hover"
          >
            Browse items
          </Button>
        </Link>
        <Link href="/submit">
          <Button size="lg" className="bg-ink text-cream hover:opacity-90">
            + Submit price
          </Button>
        </Link>
      </div>
    </nav>
  );
}
