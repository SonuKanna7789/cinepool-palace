import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "@/components/StarRating";
import { AddReviewDialog } from "@/components/AddReviewDialog";
import { Settings, Film, MessageSquare, Clock, CreditCard, LogOut, Plus } from "lucide-react";

type ProfileTab = "watched" | "reviews" | "pools";

export function UserProfile() {
  const [tab, setTab] = useState<ProfileTab>("watched");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { logout, user } = useAuth();
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const [historyRes, reviewsRes] = await Promise.all([
        supabase.from("user_watch_history").select("*").eq("user_id", user.user_id).order("watched_at", { ascending: false }),
        supabase.from("user_reviews").select("*").eq("user_id", user.user_id).order("created_at", { ascending: false }),
      ]);
      setWatchHistory(historyRes.data || []);
      setReviews(reviewsRes.data || []);
    };
    loadData();
  }, [user]);

  const userName = user?.display_name || "User";
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const watchedCount = watchHistory.length;
  const reviewCount = reviews.length;

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

      <AddReviewDialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} />

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

      <div className="flex border-b border-border mx-4">
        {([
          { key: "watched" as const, label: "Watched", icon: Film },
          { key: "reviews" as const, label: "Reviews", icon: MessageSquare },
          { key: "pools" as const, label: "Pools", icon: CreditCard },
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
                <StarRating rating={movie.rating || 0} size={10} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "reviews" && (
        <div className="p-4 space-y-3">
          {reviews.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No reviews yet.</p>
          ) : reviews.map((review: any) => (
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
            </div>
          ))}
        </div>
      )}

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
