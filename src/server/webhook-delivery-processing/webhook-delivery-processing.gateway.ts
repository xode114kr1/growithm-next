import "server-only";

// GitHub API 요청에 사용할 파일 경로의 각 구간을 인코딩한다.
function encodeGitHubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

// GitHub 파일 조회 응답 상태가 일시적인 실패인지 확인한다.
function isRetryableGitHubStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

// GitHub Raw URL에서 특정 커밋의 파일 내용을 조회한다.
export async function fetchGitHubRawContent({
  commitSha,
  path,
  repositoryFullName,
}: {
  commitSha: string;
  path: string | null;
  repositoryFullName: string;
}): Promise<string | null> {
  if (!path) {
    return null;
  }

  const url = `https://raw.githubusercontent.com/${repositoryFullName}/${commitSha}/${encodeGitHubPath(path)}`;
  let response: Response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error("GitHub 파일 조회 요청에 실패했습니다.", {
      cause: error,
    });
  }

  if (!response.ok) {
    if (isRetryableGitHubStatus(response.status)) {
      throw new Error(`GitHub 파일 조회 실패: HTTP ${response.status}`);
    }

    return null;
  }

  return response.text();
}
