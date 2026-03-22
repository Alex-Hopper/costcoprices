"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import {
  queryFromSlug,
  searchItemsBySlug,
  slugifyQuery,
  type SearchResultItem,
} from "@/lib/search";
import { createClient } from "@/lib/supabase/client";
import { useRegion } from "@/contexts/RegionContext";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import ItemCard from "@/components/ItemCard";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";
import RegionIndicator from "@/components/RegionIndicator";

export default function SearchResultsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const { region } = useRegion();
  const initialQuery = useMemo(() => queryFromSlug(slug), [slug]);
  const [query, setQuery] = useState(initialQuery);
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    let canceled = false;
    const supabase = createClient();

    const run = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await searchItemsBySlug(supabase, slug, region);
        if (!canceled) {
          setResults(data);
        }
      } catch (error) {
        if (!canceled) {
          setResults([]);
          setLoadError("Could not load search results right now.");
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      canceled = true;
    };
  }, [slug, region]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextSlug = slugifyQuery(query);
    if (!nextSlug) return;
    router.push(`/search/${nextSlug}`);
  };

  const onItemClick = (item: SearchResultItem) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  const loadingSkeletons = Array.from({ length: 10 }, (_, index) => index);

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

        <RegionIndicator />

        {loading ? (
          <div className="mt-4 rounded-2xl border border-cream-border bg-white/80 p-4 md:p-5">
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {loadingSkeletons.map((skeleton) => (
                <div key={skeleton} className="p-2">
                  <Skeleton className="h-36 w-full rounded-lg" />
                  <Skeleton className="mt-3 h-6 w-24" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        ) : loadError ? (
          <p className="mt-4 text-red-700">
            Something wen't wrong, please try again. ({loadError})</p>
        ) : results.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-cream-border bg-white/80 p-4 md:p-5">
            <p className="text-ink-muted text-center">No results found. Try another search.</p>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-cream-border bg-white/80 p-4 md:p-5">
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => onItemClick(item)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ItemDetailsDialog
        item={selectedItem}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </main>
  );
}
