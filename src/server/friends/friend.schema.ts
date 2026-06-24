import "server-only";

import type {
  FriendFiltersState,
  FriendPageSearchParams,
} from "@/types/friend";

export function parseFriendFilters(
  params: FriendPageSearchParams,
): FriendFiltersState {
  return {
    query: getFirstValue(params.query).trim(),
  };
}

export function parseFriendPage(value: string | undefined) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}
