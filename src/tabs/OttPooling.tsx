import { useState } from "react";
import { pools, OttPlatform, platformNames } from "@/data/mockData";
import { PoolCard } from "@/components/PoolCard";
import { MapPin } from "lucide-react";

const platforms: (OttPlatform | "all")[] = ["all", "netflix", "disney", "hbo", "prime"];

export function OttPooling() {
  const [filter, setFilter] = useState<OttPlatform | "all">("all");

  const filtered = filter === "all" ? pools : pools.filter((p) => p.platform === filter);

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-40 glass px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-xl">Pools</h1>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={12} className="text-primary" /> United States
          </span>
        </div>
      </header>

      {/* Platform filter */}
      <div className="flex gap-2 px-4 pt-3 overflow-x-auto scrollbar-hide">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
              filter === p
                ? "gradient-gold text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {p === "all" ? "All" : platformNames[p]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 p-4">
        {filtered.map((pool) => (
          <PoolCard key={pool.id} pool={pool} />
        ))}
      </div>
    </div>
  );
}
