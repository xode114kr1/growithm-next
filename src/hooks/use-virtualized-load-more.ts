"use client";

import type { VirtualItem } from "@tanstack/react-virtual";
import { useEffect } from "react";

const DEFAULT_LOAD_MORE_THRESHOLD = 5;

export function useVirtualizedLoadMore({
  enabled = true,
  hasNextPage,
  isLoading,
  itemCount,
  onLoadMore,
  threshold = DEFAULT_LOAD_MORE_THRESHOLD,
  virtualItems,
}: {
  enabled?: boolean;
  hasNextPage: boolean;
  isLoading: boolean;
  itemCount: number;
  onLoadMore: () => void | Promise<void>;
  threshold?: number;
  virtualItems: VirtualItem[];
}) {
  const lastVirtualItemIndex = virtualItems.at(-1)?.index;

  useEffect(() => {
    if (!enabled) return;
    if (lastVirtualItemIndex === undefined) return;
    if (!hasNextPage || isLoading) return;

    const isNearEnd = lastVirtualItemIndex >= itemCount - 1 - threshold;

    if (!isNearEnd) return;

    void onLoadMore();
  }, [
    enabled,
    hasNextPage,
    isLoading,
    itemCount,
    lastVirtualItemIndex,
    onLoadMore,
    threshold,
  ]);
}
