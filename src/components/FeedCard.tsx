import { Heart, MessageCircle, Repeat2, Bookmark, Award } from "lucide-react";
import { FeedPost } from "@/data/mockData";
import { PlatformBadge } from "./PlatformBadge";
import { StarRating } from "./StarRating";

export function FeedCard({ post }: { post: FeedPost }) {
  return (
    <article className="glass rounded-2xl overflow-hidden animate-fade-in">
      {/* Boost header */}
      {post.boostedBy && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-xs text-muted-foreground">
          <Repeat2 size={14} className="text-primary" />
          <span><span className="font-medium text-foreground">{post.boostedBy.name}</span> boosted</span>
        </div>
      )}

      {/* User row */}
      <div className="flex items-center gap-3 px-4 pt-3">
        {post.user.avatar.startsWith("http") ? (
          <img src={post.user.avatar} alt={post.user.name} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-display text-xs font-semibold text-secondary-foreground">
            {post.user.avatar}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-semibold text-sm truncate">{post.user.name}</span>
            {post.user.isEnthusiast && (
              <Award size={14} className="text-primary flex-shrink-0" />
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">{post.timeAgo}</span>
        </div>
      </div>

      {/* Review text */}
      <p className="px-4 pt-2 text-sm leading-relaxed text-secondary-foreground">
        {typeof post.review === "string" ? post.review : ""}
      </p>

      {/* Boost comment */}
      {post.boostedBy && (
        <div className="mx-4 mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground italic">
          "{post.boostedBy.comment}"
        </div>
      )}

      {/* Movie poster */}
      <div className="relative mx-4 mt-3 overflow-hidden rounded-xl">
        <img
          src={post.movie.poster}
          alt={post.movie.title}
          className="w-full h-56 object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-display font-bold text-base">{post.movie.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{post.movie.year} · {post.movie.genre}</span>
            <StarRating rating={Math.round(post.movie.rating)} size={12} />
          </div>
        </div>
      </div>

      {/* Platform badges */}
      <div className="flex items-center gap-1.5 px-4 pt-2">
        <span className="text-[10px] text-muted-foreground mr-1">Watch on</span>
        {post.movie.platforms.map((p) => (
          <PlatformBadge key={p} platform={p} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
            <Heart size={16} />
            <span className="text-xs">{post.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle size={16} />
            <span className="text-xs">{post.comments}</span>
          </button>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Repeat2 size={16} />
          </button>
        </div>
        <button className="text-muted-foreground hover:text-primary transition-colors">
          <Bookmark size={16} />
        </button>
      </div>
    </article>
  );
}
