import type { FriendProfile, FriendRequest } from "@/types/friend";

import {
  acceptFriendRequestAction,
  cancelFriendRequestAction,
  rejectFriendRequestAction,
} from "../../actions";
import { FriendActionButton } from "../friend-action-buttons";
import { FriendItem } from "../friend-item";

export default function FriendRequestList({
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
                  action={rejectFriendRequestAction}
                  fieldName="requestId"
                  fieldValue={request.requestId}
                  variant="secondary"
                >
                  거절
                </FriendActionButton>
                <FriendActionButton
                  action={acceptFriendRequestAction}
                  fieldName="requestId"
                  fieldValue={request.requestId}
                  variant="primary"
                >
                  수락
                </FriendActionButton>
              </>
            ) : (
              <FriendActionButton
                action={cancelFriendRequestAction}
                fieldName="requestId"
                fieldValue={request.requestId}
                variant="secondary"
              >
                취소
              </FriendActionButton>
            )}
          </div>
        </FriendItem>
      ))}
    </div>
  );
}
