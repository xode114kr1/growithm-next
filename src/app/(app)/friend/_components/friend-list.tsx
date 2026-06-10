"use client";

import { useMemo, useState } from "react";

import {
  AcceptFriendRequestButton,
  CancelFriendRequestButton,
  DeleteFriendButton,
  DeleteReceivedRequestButton,
} from "./friend-action-buttons";
import { FriendItem } from "./friend-item";
import type { FriendProfile, FriendRequest } from "@/types/friend";

const FRIEND_LIST_PAGE_SIZE = 6;

export function FriendList({
  friends,
  onOpenProfile,
}: {
  friends: FriendProfile[];
  onOpenProfile: (profile: FriendProfile) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(friends.length / FRIEND_LIST_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * FRIEND_LIST_PAGE_SIZE;
  const visibleFriends = useMemo(
    () => friends.slice(startIndex, startIndex + FRIEND_LIST_PAGE_SIZE),
    [friends, startIndex],
  );
  const shouldShowPagination = friends.length > FRIEND_LIST_PAGE_SIZE;

  return (
    <section className="grid grid-cols-1 gap-4">
      {visibleFriends.map((friend) => (
        <FriendItem
          key={friend.id}
          onOpenProfile={onOpenProfile}
          profile={friend}
        >
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <DeleteFriendButton friendUserId={friend.id} />
            <button
              className="rounded-lg bg-primary px-4 py-2.5 text-body-sm font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
              type="button"
            >
              Invite to Session
            </button>
          </div>
        </FriendItem>
      ))}
      {shouldShowPagination ? (
        <Pagination
          currentPage={safeCurrentPage}
          onPageChange={setCurrentPage}
          pageSize={FRIEND_LIST_PAGE_SIZE}
          showingCount={visibleFriends.length}
          totalCount={friends.length}
          totalPages={totalPages}
        />
      ) : null}
    </section>
  );
}

export function ReceivedRequestList({
  onOpenProfile,
  requests,
}: {
  onOpenProfile: (profile: FriendProfile) => void;
  requests: FriendRequest[];
}) {
  return (
    <section className="grid grid-cols-1 gap-4">
      {requests.map((request) => (
        <FriendItem
          key={request.name}
          onOpenProfile={onOpenProfile}
          profile={request}
        >
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <DeleteReceivedRequestButton requestId={request.requestId} />
            <AcceptFriendRequestButton requestId={request.requestId} />
          </div>
        </FriendItem>
      ))}
    </section>
  );
}

export function SentRequestList({
  onOpenProfile,
  requests,
}: {
  onOpenProfile: (profile: FriendProfile) => void;
  requests: FriendRequest[];
}) {
  return (
    <section className="grid grid-cols-1 gap-4">
      {requests.map((request) => (
        <FriendItem
          key={request.name}
          onOpenProfile={onOpenProfile}
          profile={request}
        >
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <CancelFriendRequestButton requestId={request.requestId} />
          </div>
        </FriendItem>
      ))}
    </section>
  );
}

function Pagination({
  currentPage,
  onPageChange,
  pageSize,
  showingCount,
  totalCount,
  totalPages,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  showingCount: number;
  totalCount: number;
  totalPages: number;
}) {
  const start = showingCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min((currentPage - 1) * pageSize + showingCount, totalCount);

  return (
    <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center">
      <div className="text-body-sm text-slate-400">
        Showing{" "}
        <span className="font-semibold text-on-surface">
          {start} - {end}
        </span>{" "}
        of {totalCount.toLocaleString()} active connections
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-400 transition-all hover:text-teal-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-slate-400"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;

          return (
            <button
              aria-current={page === currentPage ? "page" : undefined}
              className={
                page === currentPage
                  ? "size-10 rounded-lg bg-primary text-body-sm font-semibold text-on-primary"
                  : "size-10 rounded-lg text-body-sm font-semibold text-slate-500 hover:bg-slate-50"
              }
              key={page}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          );
        })}
        <button
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-400 transition-all hover:text-teal-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-slate-400"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
