"use client";

import { useActionState } from "react";
import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { INITIAL_ACTION_STATE } from "@/utils/action-state";

import type { FriendActionState } from "../actions";

export function FriendActionButton({
  action,
  children,
  className,
  fieldName,
  fieldValue,
  onSuccess,
  variant,
}: {
  action: (
    prevState: FriendActionState,
    formData: FormData,
  ) => Promise<FriendActionState>;
  children: ReactNode;
  className?: string;
  fieldName: string;
  fieldValue: string;
  onSuccess?: () => void | Promise<void>;
  variant: ComponentProps<typeof Button>["variant"];
}) {
  const handleAction = async (
    prevState: FriendActionState,
    formData: FormData,
  ): Promise<FriendActionState> => {
    const nextState = await action(prevState, formData);

    if (nextState.status === "success") {
      await onSuccess?.();
    }

    return nextState;
  };
  const [state, formAction, isPending] = useActionState(
    handleAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <div className="min-w-0">
      <form action={formAction}>
        <input name={fieldName} type="hidden" value={fieldValue} />
        <Button
          className={className}
          disabled={isPending}
          type="submit"
          variant={variant}
        >
          {children}
        </Button>
      </form>
      {state.status === "error" ? (
        <p className="mt-1 max-w-40 text-xs font-medium text-error">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
