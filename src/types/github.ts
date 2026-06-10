export type GitHubWebhookRequestBody = {
  owner?: unknown;
  repo?: unknown;
  repositoryUrl?: unknown;
};

export type GitHubRepositoryInput = {
  owner: string;
  repo: string;
};

export type GitHubReadmeContent = {
  commitSha: string;
  path: string;
  text: string;
};

export type GitHubWebhookPayload = {
  after?: unknown;
  commits?: unknown;
  repository?: {
    full_name?: unknown;
    owner?: {
      id?: unknown;
    };
  };
};

export type GitHubReadmeChange = {
  codePath: string | null;
  commitSha: string;
  path: string;
};
