import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "@/components/StarRating";
import { AddReviewDialog } from "@/components/AddReviewDialog";
import { Settings, Film, MessageSquare, Clock, CreditCard, LogOut, Plus } from "lucide-react";

type ProfileTab = "watched" | "reviews" | "pools";

export function UserProfile() {
<<<<<<< HEAD
  const [tab,             setTab            ] = useState<ProfileTab>("watched");
  const [reviewDialogOpen,setReviewDialogOpen] = useState(false);
  const { logout, user } = useAuth();
  const [watchHistory,    setWatchHistory   ] = useState<any[]>([]);
  const [reviews,         setReviews        ] = useState<any[]>([]);
=======
  const [tab, setTab] = useState<ProfileTab>("watched");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { logout, user } = useAuth();
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
>>>>>>> 822687860278937d328a1f80127f1d63ad2e187b

  const loadData = useCallback(async () => {
    if (!user) return;
    const [historyRes, reviewsRes] = await Promise.all([
<<<<<<< HEAD
      supabase
        .from("user_watch_history")
        .select("*")
        .eq("user_id", user.user_id)
        .order("watched_at", { ascending: false }),
      supabase
        .from("user_reviews")
        .select("*")
        .eq("user_id", user.user_id)
        .order("created_at", { ascending: false }),
=======
      supabase.from("user_watch_history").select("*").eq("user_id", user.user_id).order("watched_at", { ascending: false }),
      supabase.from("user_reviews").select("*").eq("user_id", user.user_id).order("created_at", { ascending: false }),
>>>>>>> 822687860278937d328a1f80127f1d63ad2e187b
    ]);
    setWatchHistory(historyRes.data || []);
    setReviews(reviewsRes.data || []);
  }, [user]);

<<<<<<< HEAD
  useEffect(() => { loadData(); }, [loadData]);

  const userName    = user?.display_name || "User";
  const initials    = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const watchedCount = watchHistory.length;
  const reviewCount  = reviews.length;
=======
  useEffect(() => {
    loadData();
  }, [loadData]);

  const userName = user?.display_name || "User";
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const watchedCount = watchHistory.length;
  const reviewCount = reviews.length;
>>>>>>> 822687860278937d328a1f80127f1d63ad2e187b

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-40 glass px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-xl">Profile</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setReviewDialogOpen(true)}
              className="rounded-full p-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              title="Add to CinePool"
            >
              <Plus size={18} />
            </button>
            <button className="rounded-full p-2 hover:bg-secondary transition-colors">
              <Settings size={18} className="text-muted-foreground" />
            </button>
            <button
              onClick={logout}
              className="rounded-full p-2 hover:bg-destructive/10 transition-colors"
              title="Sign out"
            >
              <LogOut size={18} className="text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>
      </header>

      <AddReviewDialog open={reviewDialogOpen} onClose={() => { setReviewDialogOpen(false); loadData(); }} />

<<<<<<< HEAD
      {/* Avatar & Stats */}
=======
>>>>>>> 822687860278937d328a1f80127f1d63ad2e187b
      <div className="flex flex-col items-center pt-6 pb-4">
        <div className="h-20 w-20 rounded-full gradient-gold flex items-center justify-center text-2xl font-display font-bold text-primary-foreground">
          {initials}
        </div>
        <h2 className="font-display font-bold text-lg mt-3">{userName}</h2>
        <p className="text-xs text-muted-foreground">Cinephile · {watchedCount} films watched</p>

        <div className="flex items-center gap-6 mt-4">
          <div className="text-center">
            <p className="font-display font-bold text-lg">{watchedCount}</p>
            <p className="text-[10px] text-muted-foreground">Watched</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="font-display font-bold text-lg">{reviewCount}</p>
            <p className="text-[10px] text-muted-foreground">Reviews</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="font-display font-bold text-lg text-primary">$0</p>
            <p className="text-[10px] text-muted-foreground">Saved</p>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Tabs */}
      <div className="flex border-b border-border mx-4">
        {([
          { key: "watched"  as const, label: "Watched", icon: Film          },
          { key: "reviews"  as const, label: "Reviews", icon: MessageSquare },
          { key: "pools"    as const, label: "Pools",   icon: CreditCard    },
=======
      <div className="flex border-b border-border mx-4">
        {([
          { key: "watched" as const, label: "Watched", icon: Film },
          { key: "reviews" as const, label: "Reviews", icon: MessageSquare },
          { key: "pools" as const, label: "Pools", icon: CreditCard },
>>>>>>> 822687860278937d328a1f80127f1d63ad2e187b
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
              tab === t.key
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

<<<<<<< HEAD
      {/* ── Watched Tab ── */}
      {tab === "watched" && (
        <div className="grid grid-cols-3 gap-2 p-4">
          {watchHistory.length === 0 ? (
            <p className="col-span-3 text-center text-sm text-muted-foreground py-8">
              No movies watched yet. Tap <strong>+</strong> to add your first review!
            </p>
          ) : watchHistory.map((movie: any) => (
            <div key={movie.id} className="relative rounded-xl overflow-hidden animate-fade-in bg-secondary">
              <div className="w-full aspect-[2/3]">
                {/* FIX: show TMDB poster if available */}
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.movie_title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <p className="text-[10px] font-medium text-center text-muted-foreground leading-tight">
                      {movie.movie_title}
                    </p>
                  </div>
                )}
              </div>
              {/* Rating overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-background/90 to-transparent">
=======
      {tab === "watched" && (
        <div className="grid grid-cols-3 gap-2 p-4">
          {watchHistory.length === 0 ? (
            <p className="col-span-3 text-center text-sm text-muted-foreground py-8">No movies watched yet. Add your first review!</p>
          ) : watchHistory.map((movie: any) => (
            <div key={movie.id} className="relative rounded-xl overflow-hidden animate-fade-in bg-secondary">
              <div className="w-full aspect-[2/3] flex items-center justify-center p-2">
                <p className="text-[10px] font-medium text-center">{movie.movie_title}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/80 to-transparent">
>>>>>>> 822687860278937d328a1f80127f1d63ad2e187b
                <StarRating rating={movie.rating || 0} size={10} />
              </div>
            </div>
          ))}
        </div>
      )}

<<<<<<< HEAD
      {/* ── Reviews Tab ── */}
=======
>>>>>>> 822687860278937d328a1f80127f1d63ad2e187b
      {tab === "reviews" && (
        <div className="p-4 space-y-3">
          {reviews.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No reviews yet.</p>
          ) : reviews.map((review: any) => (
<<<<<<< HEAD
            <div key={review.id} className="glass rounded-xl p-3 animate-fade-in flex gap-3">
              {/* FIX: show poster thumbnail if available */}
              {review.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${review.poster_path}`}
                  alt={review.movie_title}
                  className="w-10 h-14 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-14 rounded bg-muted flex items-center justify-center text-[9px] text-center p-1 flex-shrink-0">
                  <Film size={14} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {/* FIX: show movie_title not movie_id */}
                <p className="text-sm font-semibold truncate">
                  {review.movie_title || `Movie #${review.movie_id}`}
                </p>
                <StarRating rating={review.rating} size={10} />
                {review.review_text && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{review.review_text}</p>
                )}
                {review.platform_watched && (
                  <p className="text-[10px] text-muted-foreground mt-1 capitalize">
                    via {review.platform_watched}
                  </p>
                )}
              </div>
=======
            <div key={review.id} className="glass rounded-xl p-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium">Movie #{review.movie_id}</p>
                  <StarRating rating={review.rating} size={10} />
                </div>
              </div>
              {review.review_text && (
                <p className="text-xs text-muted-foreground mt-2">{review.review_text}</p>
              )}
>>>>>>> 822687860278937d328a1f80127f1d63ad2e187b
            </div>
          ))}
        </div>
      )}

<<<<<<< HEAD
      {/* ── Pools Tab ── */}
=======
>>>>>>> 822687860278937d328a1f80127f1d63ad2e187b
      {tab === "pools" && (
        <div className="p-4 space-y-3">
          <div className="glass rounded-xl p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-display font-semibold text-netflix">Netflix</p>
                <p className="text-xs text-muted-foreground">Premium 4K · Active</p>
              </div>
              <p className="font-display font-bold text-foreground">$4.50/mo</p>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>Next payment: Mar 1, 2026</span>
            </div>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Total saved this month</p>
            <p className="font-display font-bold text-2xl text-primary mt-1">$0.00</p>
          </div>
        </div>
      )}
    </div>
  );
}
