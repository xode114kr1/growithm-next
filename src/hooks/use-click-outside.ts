"use client";

import type { RefObject } from "react";
import { useEffect } from "react";

export function useClickOutside<TElement extends HTMLElement>({
  enabled = true,
  onClickOutside,
  ref,
}: {
  enabled?: boolean;
  onClickOutside: () => void;
  ref: RefObject<TElement | null>;
}) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const element = ref.current;
      const target = event.target;

      if (!element || !(target instanceof Node) || element.contains(target)) {
        return;
      }

      onClickOutside();
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [enabled, onClickOutside, ref]);
}
