"use client";

import Image from "next/image";
import type { SearchResultItem } from "@/lib/search";

type ItemCardProps = {
  item: SearchResultItem;
};

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <article className="rounded-xl border border-cream-border bg-white/80 p-4 shadow-sm">
      <div className="relative h-36 w-full overflow-hidden rounded-lg bg-cream/70">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-contain p-3"
        />
      </div>
      <p className="mt-3 text-xl font-semibold text-ink">${item.price.toFixed(2)}</p>
      <h2 className="mt-1 text-sm font-normal text-ink-muted">{item.name}</h2>
    </article>
  );
}
