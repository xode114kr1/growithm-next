"use client";

import { type ReactNode, useMemo, useState } from "react";

import { FriendProfileModal } from "@/components/friend-profile-modal";
import type {
  FriendProfile,
  FriendRequest,
  FriendSearchResult,
} from "@/types/friend";

import {
  FriendList,
  ReceivedRequestList,
  SentRequestList,
} from "./friend-list";
import { FriendSearchSection } from "./friend-search-section";

export default function FriendContent({
  friends,
  receivedRequests,
  searchResults,
  sentRequests,
}: {
  friends: FriendProfile[];
  receivedRequests: FriendRequest[];
  searchResults: FriendSearchResult[];
  sentRequests: FriendRequest[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<FriendProfile | null>(
    null,
  );
  const filteredSearchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return searchResults
      .filter((profile) =>
        profile.name.toLocaleLowerCase().includes(normalizedQuery),
      )
      .slice(0, 12);
  }, [searchQuery, searchResults]);

  return (
    <>
      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-12">
        <section className="space-y-6 xl:col-span-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="section-title text-on-surface">내 친구</h1>
            <FriendSearchSection
              onSearchQueryChange={setSearchQuery}
              searchQuery={searchQuery}
              searchResults={filteredSearchResults}
            />
          </div>
          <FriendList friends={friends} onOpenProfile={setSelectedProfile} />
        </section>

        <aside className="space-y-gutter xl:sticky xl:top-28 xl:col-span-4 xl:self-start">
          <RequestSection count={receivedRequests.length} title="받은 요청">
            <ReceivedRequestList
              onOpenProfile={setSelectedProfile}
              requests={receivedRequests}
            />
          </RequestSection>
          <RequestSection count={sentRequests.length} title="보낸 요청">
            <SentRequestList
              onOpenProfile={setSelectedProfile}
              requests={sentRequests}
            />
          </RequestSection>
        </aside>
      </div>
      {selectedProfile ? (
        <FriendProfileModal
          onClose={() => setSelectedProfile(null)}
          profile={selectedProfile}
        />
      ) : null}
    </>
  );
}

function RequestSection({
  children,
  count,
  title,
}: {
  children: ReactNode;
  count: number;
  title: string;
}) {
  return (
    <section className="app-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-50 p-6">
        <h2 className="section-title">{title}</h2>
        {count > 0 ? (
          <span className="rounded-full bg-error px-2 py-0.5 text-xs font-bold text-white">
            {count}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
