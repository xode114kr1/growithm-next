"use client";

import { useReplaceQueryParams } from "@/hooks/use-query-params";
import type { FriendSearchResult } from "@/types/friend";

import { FriendAddModal } from "./friend-add-modal";

export default function FriendFilters({
  query,
  searchResults,
}: {
  query: string;
  searchResults: FriendSearchResult[];
}) {
  const replaceQuery = useReplaceQueryParams();

  function handleQueryChange(nextQuery: string) {
    replaceQuery({ query: nextQuery });
  }

  return (
    <section className="flex h-11 items-center justify-between gap-3 xl:col-span-8 xl:col-start-1 xl:row-start-1">
      <input
        aria-label="친구 검색"
        className="input-field min-w-0 md:max-w-md"
        defaultValue={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        placeholder="친구 이름으로 검색"
        type="search"
      />
      <FriendAddModal searchResults={searchResults} />
    </section>
  );
}
