"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { slugifyQuery } from "@/lib/search";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import RegionIndicator from "@/components/RegionIndicator";

// Floating product images around the hero
// Replace PlaceholderBox with <Image src={src} .../> when you have real images
const FLOATING_ITEMS = [
  { id: 1, src: "/hero-images/milk.png", alt: "Milk carton", className: "absolute top-[12%] left-[6%] -rotate-12 w-[72px]" },
  { id: 2, src: "/hero-images/chicken.png", alt: "Packaged chicken", className: "absolute top-[8%] right-[8%] rotate-12 w-[64px]" },
  { id: 3, src: "/hero-images/milk.png", alt: "Milk carton", className: "absolute bottom-[28%] left-[4%] rotate-6 w-[56px]" },
  { id: 4, src: "/hero-images/chicken.png", alt: "Packaged chicken", className: "absolute bottom-[30%] right-[5%] -rotate-6 w-[60px]" },
  { id: 5, src: "/hero-images/milk.png", alt: "Milk carton", className: "absolute top-[40%] left-[13%] rotate-3 w-[48px]" },
  { id: 6, src: "/hero-images/chicken.png", alt: "Packaged chicken", className: "absolute top-[42%] right-[12%] -rotate-3 w-[52px]" },
];

function FloatingItem({ className, src, alt }: { className: string; src: string; alt: string }) {
  return (
    <div className={`${className} pointer-events-none select-none`}>
      <Image
        src={src}
        alt={alt}
        width={96}
        height={96}
        className="w-full h-auto object-contain drop-shadow-sm"
      />
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const slug = slugifyQuery(query);
    if (!slug) return;
    router.push(`/search/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-home-page">

      <Banner />
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center px-6 pt-6 pb-24 overflow-hidden min-h-[520px]">

        {FLOATING_ITEMS.map((item) => (
          <FloatingItem key={item.id} className={item.className} src={item.src} alt={item.alt} />
        ))}

        <h1 className="relative z-10 font-serif font-normal leading-none tracking-tight text-ink"
          style={{ fontSize: "clamp(52px, 9vw, 96px)" }}
        >
          Find the <em>actual</em>
          <br />
          price at Costco.
        </h1>

        <p className="relative z-10 mt-5 max-w-sm leading-relaxed text-sm text-ink-muted">
          Real prices submitted by Canadian members — not Instacart markups.
        </p>

        {/* Search */}
        <div className="relative z-10 mt-8 flex w-full max-w-[520px] items-stretch gap-1 rounded-xl bg-cream-border p-2 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
          <div className="flex min-w-0 flex-1 items-center rounded-lg bg-home-search px-4 md:px-5">
            <Search size={16} className="shrink-0 text-home-page/95" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='An item name or number'
              className="h-10 md:h-12 flex-1 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 text-md md:text-lg text-home-page placeholder:text-home-page/80"
            />
          </div>
          <Button
            size="lg"
            onClick={handleSearch}
            className="h-auto rounded-lg bg-home-search-button px-6 md:px-9 text-md md:text-lg text-home-page hover:opacity-90"
          >
            Search
          </Button>
        </div>

        <RegionIndicator />
      </section>
    </div>
  );
}
