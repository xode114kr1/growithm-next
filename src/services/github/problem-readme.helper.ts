import { ProblemPlatform } from "@/generated/prisma/client";

export type ParsedProblemReadme = {
  accuracy?: number;
  categories?: string[];
  description?: string;
  link?: string;
  memory?: string;
  platform: ProblemPlatform;
  problemId: string;
  score?: number;
  scoreMax?: number;
  submittedAtText?: string;
  tier?: string;
  time?: string;
  title: string;
};

type ProblemReadmeDraft = Partial<ParsedProblemReadme> & {
  platform: ProblemPlatform;
};

// 플랫폼 형식을 판별해 README의 문제 정보를 파싱한다.
export function parseProblemReadme(text: string) {
  if (text.includes("https://www.acmicpc.net/problem/")) {
    return validateParsedReadme(parseBaekjoonReadme(text));
  }

  if (text.includes("https://school.programmers.co.kr/")) {
    return validateParsedReadme(parseProgrammersReadme(text));
  }

  return null;
}

// 백준 README에서 문제 제출 정보를 추출한다.
function parseBaekjoonReadme(text: string): ProblemReadmeDraft {
  const result: ProblemReadmeDraft = {
    platform: ProblemPlatform.BAEKJOON,
  };

  const titleMatch = text.match(/^# \[(.+?)\] (.+?) - (\d+)/m);
  if (titleMatch) {
    result.tier = titleMatch[1];
    result.title = titleMatch[2];
    result.problemId = titleMatch[3];
  }

  const linkMatch = text.match(/\(https:\/\/www\.acmicpc\.net\/problem\/\d+\)/);
  if (linkMatch) {
    result.link = linkMatch[0].slice(1, -1);
  }

  const memoryMatch = text.match(/메모리:\s*([\d]+ KB)/);
  const timeMatch = text.match(/시간:\s*([\d]+ ms)/);
  if (memoryMatch) result.memory = memoryMatch[1];
  if (timeMatch) result.time = timeMatch[1];

  const categoryMatch = text.match(/### 분류\s+([\s\S]+?)\n\n/);
  if (categoryMatch) {
    result.categories = categoryMatch[1].trim().split(/,\s*/);
  }

  const dateMatch = text.match(/### 제출 일자\s+(.+)/);
  if (dateMatch) {
    result.submittedAtText = dateMatch[1].trim();
  }

  const descMatch = text.match(/### 문제 설명\s+([\s\S]+)/);
  if (descMatch) {
    result.description = descMatch[1].trim();
  }

  return result;
}

// 프로그래머스 README에서 문제 제출 정보를 추출한다.
function parseProgrammersReadme(text: string): ProblemReadmeDraft {
  const result: ProblemReadmeDraft = {
    platform: ProblemPlatform.PROGRAMMERS,
  };

  const titleMatch = text.match(/^# \[(.+?)\] (.+?) - (\d+)/m);
  if (titleMatch) {
    result.tier = titleMatch[1];
    result.title = titleMatch[2];
    result.problemId = titleMatch[3];
  }

  const linkMatch = text.match(
    /\(https:\/\/school\.programmers\.co\.kr\/[^)]+\)/,
  );
  if (linkMatch) {
    result.link = linkMatch[0].slice(1, -1);
  }

  const memoryMatch = text.match(/메모리:\s*([\d.]+ MB)/);
  const timeMatch = text.match(/시간:\s*([\d.]+ ms)/);
  if (memoryMatch) result.memory = memoryMatch[1];
  if (timeMatch) result.time = timeMatch[1];

  const categoryMatch = text.match(/### 구분\s+(.+)\n/);
  if (categoryMatch) {
    result.categories = categoryMatch[1]
      .replace(/\s+/g, " ")
      .trim()
      .split(">")
      .map((item) => item.trim());
  }

  const accuracyMatch = text.match(/정확성:\s*([\d.]+)%/);
  if (accuracyMatch) {
    result.accuracy = Number.parseFloat(accuracyMatch[1]);
  }

  const scoreMatch = text.match(/합계:\s*([\d.]+)\s*\/\s*([\d.]+)/);
  if (scoreMatch) {
    result.score = Number.parseFloat(scoreMatch[1]);
    result.scoreMax = Number.parseFloat(scoreMatch[2]);
  }

  const dateMatch = text.match(/### 제출 일자\s+(.+)/);
  if (dateMatch) {
    result.submittedAtText = dateMatch[1].trim();
  }

  const descMatch = text.match(/### 문제 설명\s+([\s\S]+)/);
  if (descMatch) {
    const rawDescription = descMatch[1];
    const sourceIndex = rawDescription.indexOf("\n\n> 출처");
    result.description =
      sourceIndex === -1
        ? rawDescription.trim()
        : rawDescription.slice(0, sourceIndex).trim();
  }

  return result;
}

// 파싱된 README에 필수 문제 정보가 있는지 검증한다.
function validateParsedReadme(
  parsedReadme: ProblemReadmeDraft,
): ParsedProblemReadme | null {
  if (!parsedReadme.problemId || !parsedReadme.title) {
    return null;
  }

  return parsedReadme as ParsedProblemReadme;
}
