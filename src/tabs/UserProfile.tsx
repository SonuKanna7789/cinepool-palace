import { useState } from "react";
import { useProfile, useWatchedMovies } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { watchedMovies as mockWatched } from "@/data/mockData";
import { StarRating } from "@/components/StarRating";
import { AddReviewDialog } from "@/components/AddReviewDialog";
import { Settings, Film, MessageSquare, Clock, CreditCard, LogOut, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileTab = "watched" | "reviews" | "pools";

export function UserProfile() {
  const [tab, setTab] = useState<ProfileTab>("watched");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { data: profile } = useProfile();
  const { data: apiWatched, isError } = useWatchedMovies();
  const { logout, user } = useAuth();

  const watched = Array.isArray(apiWatched)
    ? apiWatched.map((m: any) => ({
        id: m.id,
        title: m.title,
        poster: m.posterUrl ?? m.poster ?? "",
        rating: m.rating,
        watchedDate: m.watchedDate,
      }))
    : mockWatched;

  const userName = profile?.name ?? "Anika Kumar";
  const avatar = profile?.avatar ?? "AK";
  const watchedCount = profile?.watchedCount ?? 247;
  const reviewCount = profile?.reviewCount ?? 52;
  const totalSaved = profile?.totalSaved ?? 38;

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
          {avatar}
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
            <p className="font-display font-bold text-lg text-primary">${totalSaved}</p>
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
          {watched.map((movie: any) => (
            <div key={movie.id} className="relative rounded-xl overflow-hidden animate-fade-in">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-[10px] font-medium truncate">{movie.title}</p>
                <StarRating rating={movie.rating} size={10} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "reviews" && (
        <div className="p-4 space-y-3">
          {watched.slice(0, 3).map((movie: any) => (
            <div key={movie.id} className="glass rounded-xl p-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <img src={movie.poster} alt={movie.title} className="h-10 w-7 rounded object-cover" />
                <div>
                  <p className="text-sm font-medium">{movie.title}</p>
                  <StarRating rating={movie.rating} size={10} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                A truly memorable experience. Would recommend to anyone looking for quality cinema.
              </p>
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
            <p className="font-display font-bold text-2xl text-primary mt-1">${totalSaved}.50</p>
          </div>
        </div>
      )}
    </div>
  );
}
