import { Star } from "lucide-react";

export function StarRating({ rating, max = 5, size = 14 }: { rating: number; max?: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"}
        />
      ))}
    </div>
  );
}
