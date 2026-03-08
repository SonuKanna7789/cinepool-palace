import { useState } from "react";
import { useSuggestions } from "@/hooks/useApi";
import { suggestions as mockSuggestions } from "@/data/mockData";
import { SuggestionCard } from "@/components/SuggestionCard";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Suggestion } from "@/data/mockData";

function mapApiSuggestion(item: any): Suggestion {
  return {
    id: item.id,
    movie: {
      title: item.movie?.title ?? "",
      year: item.movie?.year ?? 2025,
      poster: item.movie?.posterUrl ?? item.movie?.poster ?? "",
      genre: item.movie?.genre ?? "",
      director: item.movie?.director ?? "",
      platforms: item.movie?.platforms ?? [],
    },
    matchPercent: item.matchPercent ?? 80,
    reason: item.reason ?? "",
  };
}

export function SmartSuggestions() {
  const [showMyPlatforms, setShowMyPlatforms] = useState(false);
  const { data, isLoading, isError } = useSuggestions();

  const apiSuggestions = Array.isArray(data) ? data.map(mapApiSuggestion) : null;
  const suggestions: Suggestion[] = apiSuggestions ?? mockSuggestions;

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-40 glass px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <h1 className="font-display font-bold text-xl">For You</h1>
          </div>
          <button className="rounded-full p-2 hover:bg-secondary transition-colors">
            <SlidersHorizontal size={18} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-4 pt-3">
        <button
          onClick={() => setShowMyPlatforms(!showMyPlatforms)}
          className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
            showMyPlatforms
              ? "gradient-gold text-primary-foreground"
              : "glass text-muted-foreground"
          }`}
        >
          {showMyPlatforms ? "Showing my platforms only" : "Show all platforms"}
        </button>
      </div>

      <div className="px-4 pt-2">
        <p className="text-xs text-muted-foreground mb-3">Daily Top 3 — curated for you</p>
      </div>

      <div className="flex flex-col gap-4 px-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl" />
            ))
          : suggestions.map((s, i) => (
              <SuggestionCard key={s.id} suggestion={s} index={i} />
            ))}
      </div>
    </div>
  );
}
