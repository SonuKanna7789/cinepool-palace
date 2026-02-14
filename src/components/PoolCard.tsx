import { Pool, platformNames, OttPlatform } from "@/data/mockData";
import { Clock, MapPin } from "lucide-react";

const platformStyle: Record<OttPlatform, string> = {
  netflix: "border-netflix/30 hover:border-netflix/60",
  prime: "border-prime/30 hover:border-prime/60",
  disney: "border-disney/30 hover:border-disney/60",
  hbo: "border-hbo/30 hover:border-hbo/60",
};

const platformTextColor: Record<OttPlatform, string> = {
  netflix: "text-netflix",
  prime: "text-prime",
  disney: "text-disney",
  hbo: "text-hbo",
};

export function PoolCard({ pool }: { pool: Pool }) {
  const progress = (pool.filledSlots / pool.totalSlots) * 100;

  return (
    <div className={`glass rounded-2xl p-4 border transition-all duration-200 animate-fade-in ${platformStyle[pool.platform]}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className={`font-display font-bold text-sm ${platformTextColor[pool.platform]}`}>
            {platformNames[pool.platform]}
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">{pool.plan}</p>
        </div>
        <span className="font-display font-bold text-lg text-foreground">{pool.pricePerSlot}</span>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">
            {pool.filledSlots}/{pool.totalSlots} spots filled
          </span>
          <span className="text-xs text-muted-foreground">{pool.totalSlots - pool.filledSlots} left</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full gradient-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin size={12} /> {pool.country}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {pool.expiresIn}</span>
        <span>by {pool.creator}</span>
      </div>

      {/* Join button */}
      <button className="mt-3 w-full rounded-xl gradient-gold py-2 text-sm font-display font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
        Join Pool
      </button>
    </div>
  );
}
