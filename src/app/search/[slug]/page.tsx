"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { queryFromSlug, searchItemsBySlug, slugifyQuery } from "@/lib/search";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import ItemCard from "@/components/ItemCard";

export default function SearchResultsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const initialQuery = useMemo(() => queryFromSlug(slug), [slug]);
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(() => searchItemsBySlug(slug), [slug]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextSlug = slugifyQuery(query);
    if (!nextSlug) return;
    router.push(`/search/${nextSlug}`);
  };

  return (
    <main className="min-h-screen bg-home-page">
      <Banner />
      <Navbar />

      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <form
          onSubmit={onSubmit}
          className="flex w-full max-w-[520px] items-center gap-2 rounded-lg border border-cream-border bg-home-page p-2"
        >
          <div className="flex min-w-0 flex-1 items-center rounded-md border border-cream-border bg-white/60 px-3">
            <Search size={14} className="shrink-0 text-ink-faint" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "chicken breast"'
              className="h-9 flex-1 border-0 bg-transparent px-2 text-sm text-ink placeholder:text-ink-faint shadow-none focus-visible:ring-0"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="rounded-md bg-home-search-button px-4 text-home-page hover:opacity-90"
          >
            Search
          </Button>
        </form>

        <h1 className="mt-8 text-2xl font-serif text-ink">
          Results for &quot;{queryFromSlug(slug)}&quot;
        </h1>

        {results.length === 0 ? (
          <p className="mt-4 text-ink-muted">No results found. Try another search.</p>
        ) : (
          <div className="mt-6 rounded-2xl border border-cream-border bg-white/80 p-4 md:p-5">
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
