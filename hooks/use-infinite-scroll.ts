import { useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useInfiniteScroll({
  threshold = 0.6,
  onLoadMore,
  hasMore,
}: UseInfiniteScrollOptions) {
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement) return;

    observerRef.current = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          try {
            setLoading(true);
            await onLoadMore();
          } finally {
            setLoading(false);
          }
        }
      },
      {
        threshold,
      }
    );

    observerRef.current.observe(loadMoreElement);

    return () => {
      if (observerRef.current && loadMoreElement) {
        observerRef.current.unobserve(loadMoreElement);
      }
    };
  }, [threshold, onLoadMore, hasMore, loading]);

  return { loadMoreRef, loading };
}