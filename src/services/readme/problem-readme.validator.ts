import type { ParsedProblemReadme } from "@/services/readme/problem-readme.helper";

// 파싱된 README에 필수 문제 정보가 있는지 검증한다.
export function validateParsedProblemReadme(
  parsedReadme: Partial<ParsedProblemReadme>,
): ParsedProblemReadme | null {
  if (!parsedReadme.platform || !parsedReadme.problemId || !parsedReadme.title) {
    return null;
  }

  return parsedReadme as ParsedProblemReadme;
}
