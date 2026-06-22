import { useEffect, useRef } from "react";

export function useInfiniteScroll({
  enabled,
  onLoadMore,
}: {
  enabled: boolean;
  onLoadMore: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!enabled || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [enabled, onLoadMore]);

  return sentinelRef;
}
