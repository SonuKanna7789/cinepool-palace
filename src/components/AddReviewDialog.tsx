import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Globe, Lock, Loader2 } from "lucide-react";
import { StarRating } from "./StarRating";
import { searchTMDBMovies, searchTMDBTV } from "@/services/tmdb";
import { createReview } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const PLATFORMS = ["netflix", "prime", "disney", "hbo", "apple", "cinema", "other"];

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
}

type SearchType = "movie" | "series";

export function AddReviewDialog({ open, onClose }: ReviewDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [type, setType] = useState<SearchType>("movie");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [platform, setPlatform] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const results = type === "movie"
        ? await searchTMDBMovies(query)
        : await searchTMDBTV(query);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!selectedItem || !user || rating === 0) {
      toast.error("Please select a movie and give a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const movieTitle = selectedItem.title || selectedItem.name || "Unknown";
      const posterPath = selectedItem.poster_path || null;
      const movieId = selectedItem.id.toString();

      // 1. .NET API (non-blocking)
      createReview({ movieId, text: reviewText, rating }).catch(e =>
        console.warn("Optional .NET API review failed:", e)
      );

      // 2. Upsert movie into movies table (required for foreign key)
      await supabase.from("movies").upsert({
        id: movieId,
        title: movieTitle,
        poster_path: posterPath,
        genre_ids: selectedItem.genre_ids || [],
        overview: selectedItem.overview || null,
        release_date: selectedItem.release_date || selectedItem.first_air_date || null,
        vote_average: selectedItem.vote_average || null,
      }, { onConflict: "id" });

      // 3. Supabase user_reviews
      const { error: reviewError } = await supabase.from("user_reviews").insert({
        user_id: user.user_id,
        movie_id: movieId,
        review_text: reviewText || null,
        rating,
        platform_watched: platform || null,
        is_public: isPublic,
      });
      if (reviewError) throw reviewError;

      // 3. Supabase user_watch_history
      const firstGenre = selectedItem.genre_ids?.[0] || selectedItem.genres?.[0]?.id || null;
      await supabase.from("user_watch_history").insert({
        user_id: user.user_id,
        movie_id: movieId,
        movie_title: movieTitle,
        genre: firstGenre?.toString() || null,
        rating,
      });

      toast.success("Review added to CinePool! ⭐");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["watched"] });
      handleClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to add review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedItem(null);
    setPlatform("");
    setRating(0);
    setReviewText("");
    setIsPublic(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 glass px-4 py-3 flex items-center justify-between border-b border-border">
          <h2 className="font-display font-bold text-lg">Add to CinePool</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!selectedItem ? (
            <>
              <div className="flex gap-2 rounded-xl bg-muted p-1">
                {(["movie", "series"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => { setType(t); setSearchResults([]); setSearchQuery(""); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      type === t ? "gradient-gold text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t === "movie" ? "Movie" : "Series"}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search for a movie or series..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="w-full rounded-xl bg-secondary px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />

              {isSearching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-muted transition-colors"
                    >
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-10 h-14 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-14 rounded bg-muted flex items-center justify-center text-[10px] text-center px-1 flex-shrink-0">
                          {(item.title || item.name)?.slice(0, 10)}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{item.title || item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0] || "N/A"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Selected Movie Preview */}
              <div className="flex items-center gap-4 p-4 rounded-xl glass">
                {selectedItem.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${selectedItem.poster_path}`}
                    alt={selectedItem.title || selectedItem.name}
                    className="w-16 h-24 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-24 rounded bg-muted flex items-center justify-center text-xs text-center p-2 flex-shrink-0">
                    {selectedItem.title || selectedItem.name}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-display font-bold">{selectedItem.title || selectedItem.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedItem.release_date?.split("-")[0] || selectedItem.first_air_date?.split("-")[0] || "N/A"}
                  </p>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-xs text-primary mt-1 hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Where did you watch it?</label>
                <div className="grid grid-cols-4 gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all ${
                        platform === p ? "gradient-gold text-primary-foreground" : "glass hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Your rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button
                      key={r}
                      onClick={() => setRating(r)}
                      className={`text-3xl transition-colors ${r <= rating ? "text-primary" : "text-muted"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Share your thoughts (optional)</label>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="What did you think about it?"
                  className="w-full rounded-xl bg-secondary px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  maxLength={500}
                />
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl glass">
                <div className="flex items-center gap-2">
                  {isPublic ? <Globe size={16} className="text-primary" /> : <Lock size={16} className="text-muted-foreground" />}
                  <span className="text-sm font-medium">{isPublic ? "Public" : "Just for me"}</span>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isPublic ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform ${isPublic ? "left-6" : "left-0.5"}`} />
                </button>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full py-3 rounded-xl gradient-gold text-primary-foreground font-display font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Add to CinePool ⭐"}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
