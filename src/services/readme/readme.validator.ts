export type GitHubContentResponse = {
  content?: unknown;
  encoding?: unknown;
  message?: unknown;
  type?: unknown;
};

// GitHub 파일 응답이 Base64 파일 응답인지 검증한다.
export function isGitHubFileContentResponse(
  data: GitHubContentResponse | null,
): data is GitHubContentResponse & {
  content: string;
  encoding: "base64";
  type: "file";
} {
  return (
    data?.type === "file" &&
    data.encoding === "base64" &&
    typeof data.content === "string"
  );
}
