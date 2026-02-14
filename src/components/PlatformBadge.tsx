import { OttPlatform, platformNames } from "@/data/mockData";

const colorMap: Record<OttPlatform, string> = {
  netflix: "bg-netflix/20 text-netflix border-netflix/30",
  prime: "bg-prime/20 text-prime border-prime/30",
  disney: "bg-disney/20 text-disney border-disney/30",
  hbo: "bg-hbo/20 text-hbo border-hbo/30",
};

export function PlatformBadge({ platform }: { platform: OttPlatform }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${colorMap[platform]}`}>
      {platformNames[platform]}
    </span>
  );
}
