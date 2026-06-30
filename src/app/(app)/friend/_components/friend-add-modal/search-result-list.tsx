import { Button } from "@/components/ui/button";
import type { FriendSearchResult } from "@/types/friend";

import {
  acceptFriendRequestAction,
  cancelFriendRequestAction,
  rejectFriendRequestAction,
  sendFriendRequestAction,
} from "../../actions";
import { FriendActionButton } from "../friend-action-buttons";
import { SearchResultItem } from "./search-result-item";

type SearchResultListProps = {
  onOpenProfile: (profile: FriendSearchResult) => void;
  onRefreshResults: () => Promise<void>;
  query: string;
  results: FriendSearchResult[];
};

export function SearchResultList({
  onOpenProfile,
  onRefreshResults,
  query,
  results,
}: SearchResultListProps) {
  if (!query.trim()) {
    return (
      <section className="h-80 rounded-xl border border-slate-200 bg-white" />
    );
  }

  if (results.length === 0) {
    return (
      <section className="h-80 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-body-md font-semibold text-on-background">
          검색 결과가 없습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="h-80 overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
      <div className="grid h-full gap-2 overflow-y-auto">
        {results.map((profile) => (
          <SearchResultItem
            key={profile.id}
            onOpenProfile={onOpenProfile}
            profile={profile}
          >
            {profile.relationStatus === "friend" ? (
              <Button disabled variant="secondary">
                친구
              </Button>
            ) : null}
            {profile.relationStatus === "received_request" &&
            profile.requestId ? (
              <>
                <FriendActionButton
                  action={rejectFriendRequestAction}
                  fieldName="requestId"
                  fieldValue={profile.requestId}
                  onSuccess={onRefreshResults}
                  variant="secondary"
                >
                  거절
                </FriendActionButton>
                <FriendActionButton
                  action={acceptFriendRequestAction}
                  fieldName="requestId"
                  fieldValue={profile.requestId}
                  onSuccess={onRefreshResults}
                  variant="primary"
                >
                  수락
                </FriendActionButton>
              </>
            ) : null}
            {profile.relationStatus === "sent_request" &&
            profile.requestId ? (
              <FriendActionButton
                action={cancelFriendRequestAction}
                fieldName="requestId"
                fieldValue={profile.requestId}
                onSuccess={onRefreshResults}
                variant="secondary"
              >
                취소
              </FriendActionButton>
            ) : null}
            {profile.relationStatus === "sent_request" &&
            !profile.requestId ? (
              <Button disabled variant="secondary">
                요청 보냄
              </Button>
            ) : null}
            {profile.relationStatus === "none" ? (
              <FriendActionButton
                action={sendFriendRequestAction}
                fieldName="targetUserId"
                fieldValue={profile.id}
                onSuccess={onRefreshResults}
                variant="primary"
              >
                친구 추가
              </FriendActionButton>
            ) : null}
          </SearchResultItem>
        ))}
      </div>
    </section>
  );
}
