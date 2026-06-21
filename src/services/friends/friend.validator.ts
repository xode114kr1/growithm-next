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

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}
