"use client";

import { useCallback } from "react";

import {
  type QueryParamUpdates,
  useReplaceQueryParams,
} from "@/hooks/use-query-params";

function usePaginatedQueryParams(
  updateQueryParams: (updates: QueryParamUpdates) => void,
) {
  return useCallback(
    (updates: QueryParamUpdates) =>
      updateQueryParams({ ...updates, page: null }),
    [updateQueryParams],
  );
}

export function useReplacePaginatedQueryParams() {
  return usePaginatedQueryParams(useReplaceQueryParams());
}
