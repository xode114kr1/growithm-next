const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;

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
