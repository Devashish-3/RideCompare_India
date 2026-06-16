/**
 * Animated skeleton loader for ride cards during comparison.
 * Displays placeholder cards with shimmer animation.
 */
export function SkeletonLoader() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="glass-panel rounded-2xl p-4 shadow-card"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="h-12 w-12 rounded-xl shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 rounded shimmer" />
                <div className="h-5 w-40 rounded shimmer" />
                <div className="h-3 w-32 rounded shimmer" />
              </div>
            </div>
            <div className="h-8 w-16 rounded-lg shimmer" />
          </div>
          <div className="mt-4 h-10 w-full rounded-xl shimmer" />
        </div>
      ))}
    </div>
  );
}
