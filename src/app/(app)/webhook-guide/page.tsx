import { ExternalLink } from "lucide-react";

import { WebhookRegistrationForm } from "./_components/webhook-registration-form";

const githubNewRepoUrl = "https://github.com/new";
const baekjoonHubUrl =
  "https://chromewebstore.google.com/detail/%EB%B0%B1%EC%A4%80%ED%97%88%EB%B8%8Cbaekjoonhub/ccammcjdkpgjmcpijpahlehmapgmphmk";

const steps = [
  {
    badge: "STEP 1",
    description:
      "먼저, 본인의 알고리즘 풀이를 저장할 GitHub Repository를 만들어주세요.",
    href: githubNewRepoUrl,
    linkLabel: "깃허브 Repo 만들러 가기",
    notes: ["예시 이름: algorithm-study", "Public 설정"],
    previewTitle: "깃허브 레포 생성 화면 예시",
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
      "Chrome, Edge 등 크롬 기반 브라우저 권장",
    ],
    previewTitle: "백준 허브 확장프로그램 설치/연동 예시",
    title: "백준 허브 확장 프로그램 설치",
  },
] satisfies Array<{
  badge: string;
  description: string;
  href: string;
  linkLabel: string;
  notes: string[];
  previewTitle: string;
  title: string;
}>;

export default function WebhookGuidePage() {
  return (
    <main className="page-shell">
      <div className="page-container space-y-8">
        <header className="page-header max-w-3xl">
          <p className="mb-3 text-label-caps text-secondary">Service Setup</p>
          <h1 className="page-title mb-4">서비스 연결 가이드</h1>
          <p className="text-body-md text-on-surface-variant">
            아래 순서를 따라 진행하면, 백준 풀이 기록이 GitHub Repo와 이
            서비스에 자동으로 연동됩니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-body-sm font-semibold text-primary">
            <span className="rounded-full bg-primary-fixed px-3 py-1">
              1. GitHub Repo 생성
            </span>
            <span className="rounded-full bg-primary-fixed px-3 py-1">
              2. 백준 허브 설치
            </span>
            <span className="rounded-full bg-primary-fixed px-3 py-1">
              3. 웹훅 연결
            </span>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-gutter xl:grid-cols-2">
          {steps.map((step) => (
            <GuideStepCard key={step.badge} step={step} />
          ))}
        </section>

        <RepoRegistrationSection />
      </div>
    </main>
  );
}

function GuideStepCard({ step }: { step: (typeof steps)[number] }) {
  return (
    <article className="app-card flex flex-col p-6 lg:p-8">
      <p className="mb-3 text-label-caps text-secondary">{step.badge}</p>
      <h2 className="section-title mb-3">{step.title}</h2>
      <p className="text-body-md text-on-surface-variant">{step.description}</p>
      <ul className="mt-5 grid gap-2 text-body-sm text-on-surface-variant">
        {step.notes.map((note) => (
          <li className="flex gap-2" key={note}>
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary" />
            <span>{note}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <a
          className="btn-primary"
          href={step.href}
          rel="noreferrer"
          target="_blank"
        >
          {step.linkLabel}
          <ExternalLink aria-hidden="true" size={16} strokeWidth={2.2} />
        </a>
      </div>
      <div className="mt-8 flex min-h-48 flex-1 items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-center">
        <p className="text-body-sm font-semibold text-on-surface-variant">
          {step.previewTitle}
        </p>
      </div>
    </article>
  );
}

function RepoRegistrationSection() {
  return (
    <section className="app-card grid grid-cols-1 gap-8 p-6 lg:grid-cols-[1fr_420px] lg:p-8">
      <div>
        <p className="mb-3 text-label-caps text-secondary">STEP 3</p>
        <h2 className="section-title mb-3">서비스에 GitHub 웹훅 연결하기</h2>
        <p className="text-body-md text-on-surface-variant">
          이 서비스가 사용자의 GitHub Repo에 웹훅을 연결할 수 있도록 깃허브
          ID와 Repository 이름을 입력합니다. 연결 후에는 백준 허브가 올린 커밋
          정보를 바탕으로 풀이 기록과 통계가 자동으로 갱신됩니다.
        </p>
        <ol className="mt-5 grid gap-2 text-body-sm text-on-surface-variant">
          <li>1. 본인의 깃허브 ID와 Repository 이름을 입력합니다.</li>
          <li>2. 웹훅 연결하기 버튼을 클릭해 연결을 요청합니다.</li>
          <li>3. 연결 완료 후 풀이 기록과 통계가 자동으로 갱신됩니다.</li>
        </ol>
      </div>

      <WebhookRegistrationForm />
    </section>
  );
}
