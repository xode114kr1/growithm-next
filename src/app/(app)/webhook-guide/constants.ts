export const githubNewRepoUrl = "https://github.com/new";

export const baekjoonHubUrl =
  "https://chromewebstore.google.com/detail/%EB%B0%B1%EC%A4%80%ED%97%88%EB%B8%8Cbaekjoonhub/ccammcjdkpgjmcpijpahlehmapgmphmk";

export type WebhookGuideStep = {
  badge: string;
  description: string;
  href: string;
  linkLabel: string;
  notes: readonly string[];
  title: string;
};

export const webhookGuideSteps = [
  {
    badge: "STEP 1",
    description:
      "먼저, 본인의 알고리즘 풀이를 저장할 GitHub Repository를 만들어주세요.",
    href: githubNewRepoUrl,
    linkLabel: "깃허브 Repo 만들러 가기",
    notes: ["예시 이름: algorithm-study", "Public 설정"],
    title: "깃허브 Repo 생성하기",
  },
  {
    badge: "STEP 2",
    description:
      "백준에서 문제를 제출하면 해당 코드를 자동으로 GitHub Repo에 올려주는 BaekjoonHub 브라우저 확장 프로그램을 설치합니다.",
    href: baekjoonHubUrl,
    linkLabel: "백준 허브 설치하러 가기",
    notes: [
      "확장 프로그램 옵션에서 1단계에서 만든 GitHub Repo와 연동",
      "Pick an Option 항목에서 생성한 GitHub Repository 선택",
      "Organize by platform 옵션 선택",
    ],
    title: "백준 허브 확장 프로그램 설치",
  },
] satisfies readonly WebhookGuideStep[];
