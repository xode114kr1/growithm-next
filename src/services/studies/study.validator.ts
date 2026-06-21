import { ProblemPlatform } from "@/generated/prisma/enums";
import type {
  StudyProblemFilters,
  StudyProblemPageSearchParams,
  StudyProblemSort,
} from "@/types/study";

const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;
const INVITE_TARGET_MAX_LENGTH = 120;

export function parseStudyProblemFilters(
  params: StudyProblemPageSearchParams,
): StudyProblemFilters {
  const member = parseStringParam(params.member);
  const tier = parseStringParam(params.tier);

  return {
    member: member || null,
    platform: parseStudyProblemPlatform(params.platform),
    sort: parseStudyProblemSort(params.sort),
    tier: tier || null,
  };
}

export function parseStudyProblemPage(
  page: string | string[] | undefined,
) {
  const parsedPage = Number(parseStringParam(page));

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

// 새 스터디 제목과 설명 입력값을 검증한다.
export function validateStudyInput({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  if (!title) {
    return "스터디 제목을 입력해주세요.";
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return `스터디 제목은 ${MAX_TITLE_LENGTH.toLocaleString()}자 이하로 입력해주세요.`;
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return `스터디 설명은 ${MAX_DESCRIPTION_LENGTH.toLocaleString()}자 이하로 입력해주세요.`;
  }

  return null;
}

// 스터디 초대 대상 입력값을 검증한다.
export function validateStudyInviteTarget(target: string) {
  if (!target) {
    return "초대할 사용자 이름 또는 이메일을 입력해주세요.";
  }

  if (target.length > INVITE_TARGET_MAX_LENGTH) {
    return `초대 대상은 ${INVITE_TARGET_MAX_LENGTH.toLocaleString()}자 이하로 입력해주세요.`;
  }

  return null;
}

// 스터디 설정의 제목과 설명 입력값을 검증한다.
export function validateStudySettingsInput({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  if (!title) {
    return "스터디 이름을 입력해주세요.";
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return `스터디 이름은 ${MAX_TITLE_LENGTH.toLocaleString()}자 이하로 입력해주세요.`;
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return `스터디 설명은 ${MAX_DESCRIPTION_LENGTH.toLocaleString()}자 이하로 입력해주세요.`;
  }

  return null;
}

function parseStudyProblemPlatform(
  platform: string | string[] | undefined,
) {
  const value = parseStringParam(platform);

  return value === ProblemPlatform.BAEKJOON ||
    value === ProblemPlatform.PROGRAMMERS
    ? value
    : null;
}

function parseStudyProblemSort(
  sort: string | string[] | undefined,
): StudyProblemSort {
  const value = parseStringParam(sort);

  return value === "oldest" ||
    value === "title" ||
    value === "tier" ||
    value === "member"
    ? value
    : "latest";
}

function parseStringParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() ?? "";
}
