"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useReplacePaginatedQueryParams() {
  return useQueryParams("replace", true);
}

export function usePushPaginatedQueryParams() {
  return useQueryParams("push", true);
}

export function useReplaceQueryParams() {
  return useQueryParams("replace", false);
}

function useQueryParams(method: "push" | "replace", resetPage: boolean) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      if (resetPage) {
        params.delete("page");
      }

      const queryString = params.toString();
      router[method](queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [method, pathname, resetPage, router, searchParams],
  );
}
