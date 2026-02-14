import { feedPosts } from "@/data/mockData";
import { FeedCard } from "@/components/FeedCard";
import { Search } from "lucide-react";

export function SocialFeed() {
  return (
    <div className="pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-gold-gradient">CinePool</h1>
          <button className="rounded-full p-2 hover:bg-secondary transition-colors">
            <Search size={18} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Feed */}
      <div className="flex flex-col gap-4 p-4">
        {feedPosts.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
