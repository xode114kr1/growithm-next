"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent, CompositionEvent } from "react";

export function FriendListSearch({ query }: { query: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleQueryChange(nextQuery: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (nextQuery.trim()) {
      nextSearchParams.set("query", nextQuery);
    } else {
      nextSearchParams.delete("query");
    }

    const queryString = nextSearchParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  return (
    <div className="min-w-0 flex-1 md:max-w-md">
      <input
        aria-label="친구 검색"
        className="input-field min-w-0"
        defaultValue={query}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          if (!(event.nativeEvent as InputEvent).isComposing) {
            handleQueryChange(event.target.value);
          }
        }}
        onCompositionEnd={(event: CompositionEvent<HTMLInputElement>) =>
          handleQueryChange(event.currentTarget.value)
        }
        placeholder="친구 이름으로 검색"
        type="search"
      />
    </div>
  );
}
