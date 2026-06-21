"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";

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
import { FriendAddModal } from "./friend-add-modal";
import { FriendListSearch } from "./friend-list-search";

export default function FriendContent({
  friendQuery,
  friends,
  receivedRequests,
  searchResults,
  sentRequests,
}: {
  friendQuery: string;
  friends: FriendProfile[];
  receivedRequests: FriendRequest[];
  searchResults: FriendSearchResult[];
  sentRequests: FriendRequest[];
}) {
  const [selectedProfile, setSelectedProfile] = useState<FriendProfile | null>(
    null,
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-12">
        <div className="flex items-center justify-between gap-3 xl:col-span-8 xl:col-start-1 xl:row-start-1">
          <FriendListSearch query={friendQuery} />
          <FriendAddModal searchResults={searchResults} />
        </div>

        <aside className="space-y-gutter xl:sticky xl:top-28 xl:col-span-4 xl:col-start-9 xl:row-span-2 xl:row-start-1 xl:self-start">
          <RequestSection
            count={receivedRequests.length}
            defaultOpen={receivedRequests.length > 0}
            title="받은 요청"
          >
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

        <section className="xl:col-span-8 xl:col-start-1 xl:row-start-2">
          <FriendList
            emptyMessage={
              friendQuery.trim()
                ? "검색 조건에 맞는 친구가 없습니다."
                : "아직 추가된 친구가 없습니다."
            }
            friends={friends}
            onOpenProfile={setSelectedProfile}
          />
        </section>
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
  defaultOpen = false,
  title,
}: {
  children: ReactNode;
  count: number;
  defaultOpen?: boolean;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      className="group app-card overflow-hidden"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      open={isOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between p-6 group-open:border-b group-open:border-slate-50 xl:pointer-events-none xl:cursor-default xl:border-b xl:border-slate-50 [&::-webkit-details-marker]:hidden">
        <h2 className="section-title">{title}</h2>
        <div className="flex items-center gap-3">
          {count > 0 ? (
            <span className="rounded-full bg-error px-2 py-0.5 text-xs font-bold text-white">
              {count}
            </span>
          ) : null}
          <ChevronDown
            aria-hidden="true"
            className="text-slate-400 transition-transform group-open:rotate-180 xl:hidden"
            size={20}
          />
        </div>
      </summary>
      <div className="hidden group-open:block xl:block">{children}</div>
    </details>
  );
}
