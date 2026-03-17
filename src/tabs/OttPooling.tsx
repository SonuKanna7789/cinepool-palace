import { useState } from "react";
import { usePools } from "@/hooks/useApi";
import { pools as mockPools, OttPlatform, platformNames } from "@/data/mockData";
import { PoolCard } from "@/components/PoolCard";
import { MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Pool } from "@/data/mockData";

const platforms: (OttPlatform | "all")[] = ["all", "netflix", "disney", "hbo", "prime"];

function formatExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo left`;
  return `${days}d left`;
}

function mapApiPool(item: any): Pool {
  return {
    id: String(item.id),
    platform: (item.platform?.toLowerCase() ?? "netflix") as OttPlatform,
    creator: item.creator?.name ?? item.creator ?? "Unknown",
    plan: item.plan ?? "",
    pricePerSlot: typeof item.pricePerSlot === "number" ? `$${item.pricePerSlot.toFixed(2)}` : (item.pricePerSlot ?? "$0"),
    filledSlots: item.filledSlots ?? 0,
    totalSlots: item.totalSlots ?? 4,
    country: item.country ?? "US",
    expiresIn: item.expiresAt ? formatExpiry(item.expiresAt) : (item.expiresIn ?? "—"),
  };
}

export function OttPooling() {
  const [filter, setFilter] = useState<OttPlatform | "all">("all");
  const { data, isLoading, isError } = usePools(filter === "all" ? undefined : filter);

  const rawPools = Array.isArray(data) ? data : Array.isArray((data as any)?.items) ? (data as any).items : null;
  const poolList: Pool[] = rawPools?.map(mapApiPool) ?? (isError ? mockPools.filter((p) => filter === "all" || p.platform === filter) : []);

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
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))
          : poolList.map((pool) => <PoolCard key={pool.id} pool={pool} />)}
      </div>
    </div>
  );
}
