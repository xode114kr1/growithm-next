"use client";
import {
  useWindowVirtualizer,
  VirtualItem,
  Virtualizer,
} from "@tanstack/react-virtual";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

const DEFAULT_OVERSCAN_COUNT = 6;

export function useWindowVirtualizedList<
  TContainerElement extends Element = HTMLElement,
>({
  count,
  estimateSize,
  getItemKey,
  overscan = DEFAULT_OVERSCAN_COUNT,
}: {
  count: number;
  estimateSize: () => number;
  getItemKey?: (index: number) => string | number;
  overscan?: number;
}): {
  containerRef: React.RefObject<TContainerElement | null>;
  rowVirtualizer: Virtualizer<Window, Element>;
  scrollMargin: number;
  totalSize: number;
  virtualItems: VirtualItem[];
} {
  const containerRef = useRef<TContainerElement | null>(null);

  const [scrollMargin, setScrolMargin] = useState(0);

  const updateScrollMargin = useCallback(() => {
    const container = containerRef.current;

    if (!container) return;

    setScrolMargin(container.getBoundingClientRect().top + window.scrollY);
  }, []);

  useLayoutEffect(() => {
    updateScrollMargin();

    window.addEventListener("resize", updateScrollMargin);

    return () => {
      window.removeEventListener("resize", updateScrollMargin);
    };
  }, [updateScrollMargin]);

  const rowVirtualizer = useWindowVirtualizer({
    count,
    estimateSize,
    getItemKey,
    overscan,
    scrollMargin,
  });

  return {
    containerRef,
    rowVirtualizer,
    scrollMargin,
    totalSize: rowVirtualizer.getTotalSize(),
    virtualItems: rowVirtualizer.getVirtualItems(),
  };
}
