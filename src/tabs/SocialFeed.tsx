import { useFeed } from "@/hooks/useApi";
import { feedPosts as mockPosts } from "@/data/mockData";
import { FeedCard } from "@/components/FeedCard";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { FeedPost } from "@/data/mockData";

function mapApiToFeedPost(item: any): FeedPost {
  return {
    id: item.id,
    user: {
      name: item.user?.name ?? "Unknown",
      avatar: item.user?.avatar ?? "?",
      isEnthusiast: item.user?.isEnthusiast ?? false,
    },
    movie: {
      title: item.movie?.title ?? "",
      year: item.movie?.year ?? 2025,
      poster: item.movie?.posterUrl ?? item.movie?.poster ?? "",
      genre: item.movie?.genre ?? "",
      rating: item.movie?.rating ?? 0,
      platforms: item.movie?.platforms ?? [],
    },
    review: item.text ?? item.review ?? "",
    boostedBy: item.boost
      ? { name: item.boost.name, avatar: item.boost.avatar, comment: item.boost.comment }
      : undefined,
    likes: item.likes ?? 0,
    comments: item.comments ?? 0,
    timeAgo: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString()
      : "recently",
  };
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
