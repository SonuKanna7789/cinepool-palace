import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Loader2 } from "lucide-react";
import { StarRating } from "./StarRating";
import { PlatformBadge } from "./PlatformBadge";
import { toast } from "sonner";

interface MovieDetailDialogProps {
  open: boolean;
  onClose: () => void;
  movieId: string | null;
}

export function MovieDetailDialog({ open, onClose, movieId }: MovieDetailDialogProps) {
  const [movieData, setMovieData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch movie details from .NET API when movieId changes
  useState(() => {
    if (movieId && open) {
      setIsLoading(true);
      fetch(`https://cinepool-api-production.up.railway.app/api/movies/${movieId}`)
        .then(res => res.json())
        .then(data => {
          setMovieData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          toast.error("Failed to load movie details");
          setIsLoading(false);
        });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[90vh] overflow-y-auto p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : movieData ? (
          <>
            <div className="sticky top-0 z-10 glass px-4 py-3 flex items-center justify-between border-b border-border">
              <h2 className="font-display font-bold text-lg">{movieData.title}</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Poster */}
              {movieData.posterUrl && (
                <img src={movieData.posterUrl} alt={movieData.title} className="w-full rounded-xl" />
              )}

              {/* Info */}
              <div>
                <h3 className="font-display font-bold text-2xl">{movieData.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {movieData.year} · {movieData.genre} · Dir. {movieData.director}
                </p>
              </div>

              {/* CinePool Rating */}
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">CinePool Rating</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-display font-bold text-primary">
                    ★ {movieData.rating?.toFixed(1) || "N/A"}
                  </span>
                  <span className="text-sm text-muted-foreground">({movieData.totalReviews || 0} reviews)</span>
                </div>
              </div>

              {/* Platforms */}
              {movieData.platforms && movieData.platforms.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Available on</p>
                  <div className="flex gap-2">
                    {movieData.platforms.map((p: string) => (
                      <PlatformBadge key={p} platform={p as any} />
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div>
                <h4 className="font-display font-bold mb-3">CinePool Reviews</h4>
                <div className="space-y-3">
                  {movieData.recentReviews?.length > 0 ? (
                    movieData.recentReviews.map((review: any) => (
                      <div key={review.id} className="glass rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-display font-semibold">
                            {review.user?.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.user?.name || "Anonymous"}</p>
                            <StarRating rating={review.rating} size={10} />
                          </div>
                        </div>
                        {review.text && <p className="text-xs text-muted-foreground">{review.text}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
                  )}
                </div>
              </div>

              {/* Add Review CTA */}
              <button className="w-full py-3 rounded-xl gradient-gold text-primary-foreground font-display font-semibold">
                Add Your Review
              </button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
