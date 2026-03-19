"use client";

import Image from "next/image";
import type { SearchResultItem } from "@/lib/search";

type ItemCardProps = {
  item: SearchResultItem;
  onClick?: () => void;
};

export default function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg p-2 text-left transition-colors hover:bg-white/55"
    >
      <div className="relative h-36 w-full overflow-hidden rounded-lg">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-contain p-3"
        />
      </div>
      <p className="mt-3 text-xl font-semibold text-ink">{item.price.toFixed(2)} {item.priceType === "per_kg" ? <span className="text-ink-muted">/ kg</span> : <></>}</p>
      <h2 className="mt-1 text-sm font-normal text-ink-muted">{item.name}</h2>
    </button>
  );
}
