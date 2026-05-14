"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";

import type {
  FriendListFilter,
  FriendListMap,
  FriendProfile,
  FriendRequest,
  FriendSearchResult,
} from "@/features/friend/types";

const tabs: { label: string; value: FriendListFilter }[] = [
  { label: "My Friends", value: "friends" },
  { label: "Received Requests", value: "received" },
  { label: "Sent Requests", value: "sent" },
];

export default function FriendNetwork({
  friendLists,
}: {
  friendLists: FriendListMap;
}) {
  const [activeTab, setActiveTab] = useState<FriendListFilter>("friends");
  const [pendingRequestNames, setPendingRequestNames] = useState<Set<string>>(
    () => new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchResults =
    normalizedSearchQuery.length === 0
      ? []
      : friendLists.searchResults.filter((profile) =>
          profile.name.toLowerCase().includes(normalizedSearchQuery),
        );
  const isSearching = normalizedSearchQuery.length > 0;

  function handleAddFriend(profileName: string) {
    setPendingRequestNames((current) => {
      const next = new Set(current);
      next.add(profileName);
      return next;
    });
  }

  return (
    <>
      <section className="mb-8 flex flex-col items-stretch justify-between gap-6 md:flex-row md:items-center">
        <div className="grid rounded-xl bg-slate-100 p-1 sm:grid-cols-3 md:flex md:w-auto">
          {tabs.map((tab) => (
            <button
              className={
                activeTab === tab.value
                  ? "rounded-lg bg-white px-6 py-2 text-body-sm font-semibold text-teal-900 shadow-sm"
                  : "rounded-lg px-6 py-2 text-body-sm font-medium text-slate-500 transition-colors hover:text-teal-800"
              }
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="relative w-full md:w-96">
          <span
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            Search
          </span>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-20 pr-4 text-body-md shadow-sm outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Find developers..."
            type="text"
            value={searchQuery}
          />
        </label>
      </section>

      {isSearching ? (
        <SearchResultList
          onAddFriend={handleAddFriend}
          pendingRequestNames={pendingRequestNames}
          query={searchQuery}
          results={searchResults}
        />
      ) : (
        <>
          {activeTab === "friends" && (
            <FriendList friends={friendLists.friends} />
          )}
          {activeTab === "received" && (
            <ReceivedRequestList requests={friendLists.received} />
          )}
          {activeTab === "sent" && (
            <SentRequestList requests={friendLists.sent} />
          )}
        </>
      )}
    </>
  );
}

function SearchResultList({
  onAddFriend,
  pendingRequestNames,
  query,
  results,
}: {
  onAddFriend: (profileName: string) => void;
  pendingRequestNames: Set<string>;
  query: string;
  results: FriendSearchResult[];
}) {
  if (results.length === 0) {
    return (
      <section className="app-card p-8 text-center">
        <h2 className="section-title mb-2 text-on-background">
          No developers found
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Try another name or check the spelling for &quot;{query.trim()}&quot;.
        </p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4">
      {results.map((profile) => (
        <ProfileCard key={profile.name} profile={profile}>
          <SearchResultActions
            isPending={pendingRequestNames.has(profile.name)}
            onAddFriend={() => onAddFriend(profile.name)}
            profile={profile}
          />
        </ProfileCard>
      ))}
    </section>
  );
}

function SearchResultActions({
  isPending,
  onAddFriend,
  profile,
}: {
  isPending: boolean;
  onAddFriend: () => void;
  profile: FriendSearchResult;
}) {
  if (profile.relationStatus === "friend") {
    return (
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <ViewProfileButton />
        <button
          className="rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-500"
          disabled
          type="button"
        >
          Friends
        </button>
      </div>
    );
  }

  if (profile.relationStatus === "received_request") {
    return (
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <ViewProfileButton />
        <button
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
          type="button"
        >
          Respond
        </button>
      </div>
    );
  }

  if (profile.relationStatus === "sent_request" || isPending) {
    return (
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <ViewProfileButton />
        <button
          className="rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-500"
          disabled
          type="button"
        >
          Request Sent
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <ViewProfileButton />
      <button
        className="rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
        onClick={onAddFriend}
        type="button"
      >
        Add Friend
      </button>
    </div>
  );
}

function ViewProfileButton() {
  return (
    <button
      className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-teal-900"
      type="button"
    >
      View Profile
    </button>
  );
}

function FriendList({ friends }: { friends: FriendProfile[] }) {
  return (
    <section className="grid grid-cols-1 gap-4">
      {friends.map((friend) => (
        <ProfileCard key={friend.name} profile={friend}>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <ViewProfileButton />
            <button
              className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-error"
              type="button"
            >
              Delete Friend
            </button>
            <button
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
              type="button"
            >
              Invite to Session
            </button>
          </div>
        </ProfileCard>
      ))}
      <Pagination summary={`Showing ${friends.length} active connections`} />
    </section>
  );
}

function ReceivedRequestList({ requests }: { requests: FriendRequest[] }) {
  return (
    <section className="grid grid-cols-1 gap-4">
      {requests.map((request) => (
        <ProfileCard key={request.name} profile={request}>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <ViewProfileButton />
            <button
              className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50"
              type="button"
            >
              Delete Request
            </button>
            <button
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
              type="button"
            >
              Accept
            </button>
          </div>
        </ProfileCard>
      ))}
    </section>
  );
}

function SentRequestList({ requests }: { requests: FriendRequest[] }) {
  return (
    <section className="grid grid-cols-1 gap-4">
      {requests.map((request) => (
        <ProfileCard key={request.name} profile={request}>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <ViewProfileButton />
            <button
              className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-error"
              type="button"
            >
              Cancel Request
            </button>
          </div>
        </ProfileCard>
      ))}
    </section>
  );
}

function ProfileCard({
  children,
  profile,
}: {
  children: ReactNode;
  profile: FriendProfile;
}) {
  return (
    <article
      className={`app-card flex flex-col items-center gap-6 p-6 transition-all hover:border-slate-200 md:flex-row ${
        profile.offline ? "opacity-80 hover:opacity-100" : ""
      }`}
    >
      <div className="relative shrink-0">
        <Image
          alt={`${profile.name} avatar`}
          className={`size-16 rounded-full object-cover ring-4 ring-slate-50 ${
            profile.offline ? "grayscale" : ""
          }`}
          height={64}
          src={profile.avatar}
          width={64}
        />
        <span
          className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white ${
            profile.offline ? "bg-slate-300" : "bg-green-500"
          }`}
        />
      </div>
      <div className="min-w-0 flex-1 text-center md:text-left">
        <div className="mb-1 flex flex-col gap-2 md:flex-row md:items-center">
          <h2 className="section-title text-on-background">{profile.name}</h2>
          <span
            className={`mx-auto w-fit rounded-full border px-3 py-0.5 text-2.5 font-bold uppercase tracking-widest md:mx-0 ${profile.tierClass}`}
          >
            {profile.tier}
          </span>
        </div>
      </div>
      {children}
    </article>
  );
}

function Pagination({ summary }: { summary: string }) {
  return (
    <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center">
      <div className="text-body-sm text-slate-400">{summary}</div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-400 transition-all hover:text-teal-900"
          type="button"
        >
          Prev
        </button>
        <button
          className="size-10 rounded-lg bg-primary text-body-sm font-semibold text-on-primary"
          type="button"
        >
          1
        </button>
        <button
          className="size-10 rounded-lg text-body-sm font-semibold text-slate-500 hover:bg-slate-50"
          type="button"
        >
          2
        </button>
        <button
          className="size-10 rounded-lg text-body-sm font-semibold text-slate-500 hover:bg-slate-50"
          type="button"
        >
          3
        </button>
        <button
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-400 transition-all hover:text-teal-900"
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
