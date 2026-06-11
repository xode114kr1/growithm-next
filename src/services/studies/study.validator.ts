const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;
const INVITE_TARGET_MAX_LENGTH = 120;

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
