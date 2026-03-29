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

      <div className="absolute left-1/2 -translate-x-1/2 mt-2 border-2 border-white rounded-xs hidden sm:block">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="16" viewBox="0 0 9600 4800">
          <path fill="#f00" d="m0 0h2400l99 99h4602l99-99h2400v4800h-2400l-99-99h-4602l-99 99H0z"/>
          <path fill="#fff" d="m2400 0h4800v4800h-4800zm2490 4430-45-863a95 95 0 0 1 111-98l859 151-116-320a65 65 0 0 1 20-73l941-762-212-99a65 65 0 0 1-34-79l186-572-542 115a65 65 0 0 1-73-38l-105-247-423 454a65 65 0 0 1-111-57l204-1052-327 189a65 65 0 0 1-91-27l-332-652-332 652a65 65 0 0 1-91 27l-327-189 204 1052a65 65 0 0 1-111 57l-423-454-105 247a65 65 0 0 1-73 38l-542-115 186 572a65 65 0 0 1-34 79l-212 99 941 762a65 65 0 0 1 20 73l-116 320 859-151a95 95 0 0 1 111 98l-45 863z"/>
        </svg>
      </div>

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
