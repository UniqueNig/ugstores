// Reusable shimmering placeholder blocks shown while data loads.
// Uses the theme's card color and a pulse animation.

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{ backgroundColor: "var(--card-bg)", ...style }}
    />
  );
}

/** Card-shaped skeleton matching the product grid layout. */
export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="w-full aspect-[3/4]" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  );
}

/** A grid of product card skeletons. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
