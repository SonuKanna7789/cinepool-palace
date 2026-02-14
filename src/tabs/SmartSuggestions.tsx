import { useState } from "react";
import { suggestions } from "@/data/mockData";
import { SuggestionCard } from "@/components/SuggestionCard";
import { Sparkles, SlidersHorizontal } from "lucide-react";

export function SmartSuggestions() {
  const [showMyPlatforms, setShowMyPlatforms] = useState(false);

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

      {/* OTT filter toggle */}
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
        {suggestions.map((s, i) => (
          <SuggestionCard key={s.id} suggestion={s} index={i} />
        ))}
      </div>
    </div>
  );
}
