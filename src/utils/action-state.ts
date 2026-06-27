import type { ActionState } from "@/types/action-state";

export const INITIAL_ACTION_STATE = {
  error: null,
  status: "idle",
} satisfies ActionState<"idle">;
