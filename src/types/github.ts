export type GitHubRepositoryWebhookSummary = {
  repositoryFullName: string;
};

export type GitHubProblemMetadata = {
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

export type GitHubProblemFileChange = {
  codePath: string | null;
  commitSha: string;
  metadataPath: string;
};
