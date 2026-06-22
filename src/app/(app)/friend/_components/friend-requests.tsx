"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";

import { ProfileModal } from "@/components/ui/profile-modal";
import type { FriendProfile, FriendRequest } from "@/types/friend";

import { FriendActionButton } from "./friend-action-buttons";
import { FriendItem } from "./friend-item";

export default function FriendRequests({
  receivedRequests,
  sentRequests,
}: {
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
}) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <>
      <aside className="space-y-gutter xl:sticky xl:top-28 xl:col-span-4 xl:col-start-9 xl:row-span-2 xl:row-start-1 xl:self-start">
        <RequestSection
          count={receivedRequests.length}
          title="받은 요청"
        >
          <RequestList
            emptyMessage="받은 친구 요청이 없습니다."
            onOpenProfile={(profile) => setSelectedUserId(profile.id)}
            requests={receivedRequests}
            type="received"
          />
        </RequestSection>
        <RequestSection count={sentRequests.length} title="보낸 요청">
          <RequestList
            emptyMessage="보낸 친구 요청이 없습니다."
            onOpenProfile={(profile) => setSelectedUserId(profile.id)}
            requests={sentRequests}
            type="sent"
          />
        </RequestSection>
      </aside>
      {selectedUserId ? (
        <ProfileModal
          onClose={() => setSelectedUserId(null)}
          userId={selectedUserId}
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="app-card overflow-hidden">
      <button
        aria-expanded={isOpen}
        className={`flex w-full cursor-pointer items-center justify-between p-6 text-left ${
          isOpen ? "border-b border-slate-50" : ""
        }`}
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
        type="button"
      >
        <h2 className="section-title">{title}</h2>
        <div className="flex items-center gap-3">
          {count > 0 ? (
            <span className="rounded-full bg-error px-2 py-0.5 text-xs font-bold text-white">
              {count}
            </span>
          ) : null}
          <ChevronDown
            aria-hidden="true"
            className={`text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            size={20}
          />
        </div>
      </button>
      <div className={isOpen ? "block" : "hidden"}>{children}</div>
    </section>
  );
}

function RequestList({
  emptyMessage,
  onOpenProfile,
  requests,
  type,
}: {
  emptyMessage: string;
  onOpenProfile: (profile: FriendProfile) => void;
  requests: FriendRequest[];
  type: "received" | "sent";
}) {
  if (requests.length === 0) {
    return (
      <div className="p-6 text-center text-body-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50">
      {requests.map((request) => (
        <FriendItem
          compact
          key={request.id}
          onOpenProfile={onOpenProfile}
          profile={request}
        >
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            {type === "received" ? (
              <>
                <FriendActionButton
                  actionType="reject"
                  id={request.requestId}
                />
                <FriendActionButton
                  actionType="accept"
                  id={request.requestId}
                />
              </>
            ) : (
              <FriendActionButton
                actionType="cancel"
                id={request.requestId}
              />
            )}
          </div>
        </FriendItem>
      ))}
    </div>
  );
}
