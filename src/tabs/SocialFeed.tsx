import { useState } from "react";
import { useFeed } from "@/hooks/useApi";
import { feedPosts as mockPosts } from "@/data/mockData";
import { FeedCard } from "@/components/FeedCard";
import { MovieDetailDialog } from "@/components/MovieDetailDialog";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { FeedPost } from "@/data/mockData";

function safeString(val: unknown, fallback = ""): string {
  if (val == null) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return fallback;
}

function mapApiToFeedPost(item: any): FeedPost {
  // API nests data under item.review { user, movie, text, recentBoosts }
  const r = item.review ?? item;
  const user = r.user ?? item.user;
  const movie = r.movie ?? item.movie;
  const boosts = Array.isArray(r.recentBoosts) && r.recentBoosts.length > 0
    ? r.recentBoosts[0]
    : null;

  return {
    id: safeString(item.id ?? r.id, crypto.randomUUID()),
    user: {
      name: safeString(user?.name, "Unknown"),
      avatar: safeString(user?.avatar, "?"),
      isEnthusiast: !!user?.isEnthusiast,
    },
    movie: {
      title: safeString(movie?.title),
      year: Number(movie?.year) || 2025,
      poster: safeString(movie?.posterUrl || movie?.poster),
      genre: safeString(movie?.genre),
      rating: Number(movie?.rating) || 0,
      platforms: Array.isArray(movie?.platforms)
        ? movie.platforms.filter((p: unknown) => typeof p === "string")
        : [],
    },
    review: safeString(r.text ?? r.review),
    boostedBy: boosts
      ? {
          name: safeString(boosts.boosterUser?.name),
          avatar: safeString(boosts.boosterUser?.avatar),
          comment: safeString(boosts.comment),
        }
      : undefined,
    likes: Number(r.boostCount) || 0,
    comments: 0,
    timeAgo: item.createdAt
      ? formatTimeAgo(new Date(item.createdAt))
      : "recently",
  };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function SocialFeed() {
  const { data, isLoading, isError } = useFeed();

  const posts: FeedPost[] =
    data?.items?.map(mapApiToFeedPost) ?? (isError || !data ? mockPosts : []);

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-40 glass px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-gold-gradient">CinePool</h1>
          <button className="rounded-full p-2 hover:bg-secondary transition-colors">
            <Search size={18} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-4 p-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))
          : posts.map((post) => <FeedCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
