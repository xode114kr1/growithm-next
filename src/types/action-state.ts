export type ActionStatus = "idle" | "error" | "success";

export type ActionState<TStatus extends ActionStatus = ActionStatus> = {
  error: string | null;
  status: TStatus;
};
