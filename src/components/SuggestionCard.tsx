import { Suggestion } from "@/data/mockData";
import { PlatformBadge } from "./PlatformBadge";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export function SuggestionCard({ suggestion, index }: { suggestion: Suggestion; index: number }) {
  const matchColor = suggestion.matchPercent >= 90 ? "text-match-high" : "text-match-mid";

  return (
    <div
      className="glass rounded-2xl overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative">
        <img
          src={suggestion.movie.poster}
          alt={suggestion.movie.title}
          className="w-full h-72 object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Match badge */}
        <div className="absolute top-3 right-3 glass rounded-full px-3 py-1">
          <span className={`font-display font-bold text-sm ${matchColor}`}>
            {suggestion.matchPercent}% Match
          </span>
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display font-bold text-xl">{suggestion.movie.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {suggestion.movie.year} · {suggestion.movie.genre} · Dir. {suggestion.movie.director}
          </p>
          <p className="text-xs text-primary mt-1.5 font-medium">{suggestion.reason}</p>
          <div className="flex items-center gap-1.5 mt-2">
            {suggestion.movie.platforms.map((p) => (
              <PlatformBadge key={p} platform={p} />
            ))}
          </div>
        </div>
      </div>

      {/* Swipe actions */}
      <div className="flex items-center justify-center gap-6 p-4">
        <button className="flex h-12 w-12 items-center justify-center rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
          <ThumbsDown size={20} />
        </button>
        <button className="flex h-14 w-14 items-center justify-center rounded-full gradient-gold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg">
          <ThumbsUp size={22} />
        </button>
      </div>
    </div>
  );
}
