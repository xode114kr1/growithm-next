"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type QueryParamUpdates = Record<string, string | null>;

export function useReplaceQueryParams() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function replaceQueryParams(updates: QueryParamUpdates) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(url, {
      scroll: false,
    });
  }

  return replaceQueryParams;
}
