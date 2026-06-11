import "server-only";

// GitHub raw content URL에서 풀이 코드 파일을 조회한다.
export function fetchGitHubRawCode(url: string) {
  return fetch(url);
}
