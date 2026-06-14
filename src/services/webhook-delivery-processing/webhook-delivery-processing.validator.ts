import type { ProblemPlatform } from "@/generated/prisma/client";
import type { WebhookDeliveryQueueMessage } from "@/types/queue";

export type GitHubContentResponse = {
  content?: unknown;
  encoding?: unknown;
  message?: unknown;
  size?: unknown;
  type?: unknown;
};

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

// GitHub 파일 응답이 Base64 파일 응답인지 검증한다.
export function isGitHubFileContentResponse(
  data: GitHubContentResponse | null,
): data is GitHubContentResponse & {
  content: string;
  encoding: "base64";
  size: number;
  type: "file";
} {
  return (
    data?.type === "file" &&
    data.encoding === "base64" &&
    typeof data.content === "string" &&
    typeof data.size === "number"
  );
}

// 파싱된 README에 필수 문제 정보가 있는지 검증한다.
export function validateParsedProblemReadme(
  parsedReadme: Partial<ParsedProblemReadme>,
): ParsedProblemReadme | null {
  if (!parsedReadme.platform || !parsedReadme.problemId || !parsedReadme.title) {
    return null;
  }

  return parsedReadme as ParsedProblemReadme;
}

// Queue 메시지에 처리할 웹훅 delivery ID가 있는지 검증한다.
export function isWebhookDeliveryQueueMessage(
  message: unknown,
): message is WebhookDeliveryQueueMessage {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  const webhookDeliveryId = Reflect.get(message, "webhookDeliveryId");

  return typeof webhookDeliveryId === "string" && webhookDeliveryId.length > 0;
}
