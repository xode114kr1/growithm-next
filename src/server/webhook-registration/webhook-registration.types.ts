import "server-only";

export type GitHubWebhookRequestBody = {
  owner?: unknown;
  repo?: unknown;
  repositoryUrl?: unknown;
};

export type GitHubRepositoryInput = {
  owner: string;
  repo: string;
};

export type GitHubWebhookResponse = {
  config?: {
    url?: unknown;
  };
  id?: unknown;
  message?: unknown;
};

export type GitHubWebhookClientError = {
  message: string;
  ok: false;
  status: number;
};

export type GitHubWebhookSummary = {
  hookId: number | null;
  url: string | null;
};

export type RegisterGitHubWebhookResult =
  | {
      body: {
        hookId: number | null;
        message: string;
        repository: GitHubRepositoryInput;
      };
      status?: never;
    }
  | {
      body: { message: string };
      status: number;
    };
