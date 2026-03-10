import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, SlidersHorizontal, ThumbsDown, ThumbsUp, Bookmark, Loader2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PlatformBadge } from "@/components/PlatformBadge";
import { getSuggestions, submitSuggestionFeedback, getTMDBPoster } from "@/services/tmdb";
import { toast } from "sonner";

export function SmartSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [posters, setPosters] = useState<Record<string, string>>({});

  const loadSuggestions = async (forceRefresh: boolean = false) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await getSuggestions(user.id, forceRefresh);
      const newSuggestions = data.suggestions || [];
      setSuggestions(newSuggestions);
      setCurrentIndex(0);

      // Fetch TMDB posters
      const posterPromises = newSuggestions.map(async (s: any) => {
        const poster = await getTMDBPoster(s.title, s.year);
        return { key: `${s.title}-${s.year}`, poster };
      });
      const posterResults = await Promise.all(posterPromises);
      const posterMap: Record<string, string> = {};
      posterResults.forEach(p => posterMap[p.key] = p.poster);
      setPosters(posterMap);
    } catch (err: any) {
      toast.error(err.message || "Failed to load suggestions");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [user]);

  const handleAction = async (action: string) => {
    if (!user || !suggestions[currentIndex]) return;

    const suggestion = suggestions[currentIndex];
    const movieId = `${suggestion.title.toLowerCase().replace(/\s+/g, "-")}-${suggestion.year}`;

    try {
      await submitSuggestionFeedback(user.user_id, movieId, action);
      
      if (action === "like") {
        toast.success(`Added ${suggestion.title} to your likes!`);
      } else if (action === "save") {
        toast.success(`Saved ${suggestion.title} for later!`);
      }

      // Move to next
      if (currentIndex < suggestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // All done, refresh
        setIsRefreshing(true);
        toast.success("Generating new picks...");
        await loadSuggestions(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback");
    }
  };

  const currentSuggestion = suggestions[currentIndex];
  const posterUrl = currentSuggestion ? posters[`${currentSuggestion.title}-${currentSuggestion.year}`] : "";

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-40 glass px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <h1 className="font-display font-bold text-xl">For You</h1>
          </div>
          <button 
            onClick={() => { setIsRefreshing(true); loadSuggestions(true); }}
            disabled={isRefreshing}
            className="rounded-full p-2 hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={`text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <div className="px-4 pt-3">
        <p className="text-xs text-muted-foreground mb-3">Powered by AI · Based on your taste</p>
      </div>

      {isLoading ? (
        <div className="px-4">
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
      ) : currentSuggestion ? (
        <div className="px-4 animate-fade-in">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="relative">
              {posterUrl ? (
                <img src={posterUrl} alt={currentSuggestion.title} className="w-full h-96 object-cover" />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-8">
                  <p className="font-display font-bold text-2xl text-center">{currentSuggestion.title}</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

              {/* Match badge */}
              <div className="absolute top-3 right-3 glass rounded-full px-3 py-1">
                <span className="font-display font-bold text-sm text-primary">
                  {currentSuggestion.matchPercent}% Match
                </span>
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-display font-bold text-2xl">{currentSuggestion.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentSuggestion.year} · {currentSuggestion.genre} · Dir. {currentSuggestion.director}
                </p>
                <p className="text-xs text-primary mt-2 font-medium">{currentSuggestion.reason}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  {currentSuggestion.platforms?.map((p: string) => (
                    <PlatformBadge key={p} platform={p as any} />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4 p-5">
              <button
                onClick={() => handleAction("dislike")}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
              >
                <ThumbsDown size={22} />
              </button>
              <button
                onClick={() => handleAction("save")}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/30 text-primary hover:bg-primary/10 transition-colors"
              >
                <Bookmark size={22} />
              </button>
              <button
                onClick={() => handleAction("like")}
                className="flex h-16 w-16 items-center justify-center rounded-full gradient-gold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg"
              >
                <ThumbsUp size={24} />
              </button>
            </div>

            {/* Progress */}
            <div className="px-4 pb-4">
              <div className="flex gap-1">
                {suggestions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      idx <= currentIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 text-center py-12">
          <p className="text-muted-foreground">No suggestions available. Complete your onboarding to get personalized picks!</p>
        </div>
      )}
    </div>
  );
}
