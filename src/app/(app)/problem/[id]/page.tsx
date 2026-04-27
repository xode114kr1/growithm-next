import Link from "next/link";
import CopyCodeButton from "@/app/(app)/problem/[id]/_components/copy-code-button";
import ReviewMemo from "@/app/(app)/problem/[id]/_components/review-memo";

type Problem = {
  categories: string[];
  code: string;
  completedAt: string | null;
  createdAt: string;
  description: string;
  id: string;
  language: string;
  link: string;
  memo: string;
  memory: string;
  platform: "BAEKJOON" | "PROGRAMMERS" | "LEETCODE";
  problemId: string;
  solvedAt: string;
  state: "PENDING" | "COMPLETE";
  tier: string;
  time: string;
  title: string;
  updatedAt: string;
  userId: string;
};

const problem: Problem = {
  categories: ["Greedy"],
  code: `t = int(input())

for _ in range(t):
    n = int(input())
    lst = list(map(int,input().split()))
    ans = 0
    max_sum = lst[-1]
    for k in lst[::-1]:
        if k > max_sum :
            max_sum = k
        else:
            ans += max_sum - k
    print(ans)`,
  completedAt: null,
  createdAt: "2025-12-21T00:00:00.000Z",
  description: `<p>홍준이는 요즘 주식에 빠져있다. 그는 미래를 내다보는 눈이 뛰어나, 날 별로 주가를 예상하고 언제나 그게 맞아떨어진다. 매일 그는 아래 세 가지 중 한 행동을 한다.</p>
<ol>
  <li>주식 하나를 산다.</li>
  <li>원하는 만큼 가지고 있는 주식을 판다.</li>
  <li>아무것도 안한다.</li>
</ol>
<p>홍준이는 미래를 예상하는 뛰어난 안목을 가졌지만, 어떻게 해야 자신이 최대 이익을 얻을 수 있는지 모른다. 따라서 당신에게 날 별로 주식의 가격을 알려주었을 때, 최대 이익이 얼마나 되는지 계산을 해달라고 부탁했다.</p>
<h3>입력</h3>
<p>입력의 첫 줄에는 테스트케이스 수를 나타내는 자연수 T가 주어진다. 각 테스트케이스 별로 첫 줄에는 날의 수를 나타내는 자연수 N(2 <= N <= 1,000,000)이 주어지고, 둘째 줄에는 날 별 주가를 나타내는 N개의 자연수들이 공백으로 구분되어 순서대로 주어진다. 날 별 주가는 10,000이하다.</p>
<h3>출력</h3>
<p>각 테스트케이스 별로 최대 이익을 나타내는 정수 하나를 출력한다. 답은 부호있는 64bit 정수형으로 표현 가능하다.</p>`,
  id: "6946c40ab3c5f0c6ca7e5850",
  language: "python",
  link: "https://www.acmicpc.net/problem/11501",
  memo: "",
  memory: "154744 KB",
  platform: "BAEKJOON",
  problemId: "11501",
  solvedAt: "2025-12-21",
  state: "PENDING",
  tier: "Silver II",
  time: "2540 ms",
  title: "주식",
  updatedAt: "2025-12-21T00:00:00.000Z",
  userId: "69463ce719ab562513d27f5f",
};

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <main className="page-shell">
      <div className="mx-auto w-full max-w-[1120px] space-y-8">
        <ProblemHeader problem={problem} />
        <ProblemMetadata problem={problem} />
        <ProblemDescription description={problem.description} />
        <SubmittedCode
          code={problem.code}
          language={problem.language}
          problemId={problem.problemId}
        />
        <ReviewMemo initialMemo={problem.memo} initialState={problem.state} />
      </div>
    </main>
  );
}

function ProblemHeader({ problem }: { problem: Problem }) {
  return (
    <header className="border-b border-outline-variant/40 pb-8">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-body-sm text-slate-500">
        <Link className="font-semibold transition-colors hover:text-primary" href="/problem">
          Problems
        </Link>
        <span>/</span>
        <span>{problem.platform}</span>
        <span>/</span>
        <span>{problem.problemId}</span>
      </div>

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-body-sm font-semibold text-on-primary">
              {problem.platform}
            </span>
            <span className="badge-tier-silver">{problem.tier}</span>
            <ProblemStateBadge state={problem.state} />
          </div>
          <p className="mb-2 text-label-caps text-slate-400">
            Problem {problem.problemId}
          </p>
          <h1 className="page-title text-pretty break-words text-primary">
            {problem.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link className="btn-secondary" href="/problem">
            뒤로가기
          </Link>
          <a
            className="btn-primary"
            href={problem.link}
            rel="noreferrer"
            target="_blank"
          >
            원문 보기
          </a>
        </div>
      </div>
    </header>
  );
}

function ProblemMetadata({ problem }: { problem: Problem }) {
  const metadata = [
    { label: "Memory", value: problem.memory },
    { label: "Time", value: problem.time },
    { label: "Solved", value: problem.solvedAt },
    ...(problem.completedAt
      ? [{ label: "Completed", value: problem.completedAt }]
      : []),
  ];

  return (
    <section className="app-card p-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metadata.map((item) => (
          <div key={item.label}>
            <p className="text-label-caps text-slate-400">{item.label}</p>
            <p className="mt-1 text-body-md font-semibold text-on-surface">
              {item.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
        {problem.categories.map((category) => (
          <span
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-body-sm font-medium text-slate-600"
            key={category}
          >
            {category}
          </span>
        ))}
      </div>
    </section>
  );
}

function ProblemDescription({ description }: { description: string }) {
  return (
    <section className="app-card p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-8 w-1 rounded-full bg-secondary-fixed-dim" />
        <h2 className="section-title">문제 설명</h2>
      </div>
      <div
        className="problem-description text-body-md text-on-surface-variant"
        // Server-provided HTML must be sanitized before rendering in production.
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </section>
  );
}

function SubmittedCode({
  code,
  language,
  problemId,
}: {
  code: string;
  language: string;
  problemId: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl bg-tertiary shadow-xl shadow-slate-950/10">
      <div className="flex flex-col justify-between gap-3 bg-tertiary-container px-5 py-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-label-caps text-on-tertiary-container">Submitted Code</p>
          <p className="truncate font-mono text-sm text-slate-200">
            {problemId}.{language === "python" ? "py" : language}
          </p>
        </div>
        <CopyCodeButton code={code} />
      </div>
      <div className="max-h-[520px] overflow-auto p-5">
        <pre className="min-w-max whitespace-pre font-mono text-sm leading-7 text-slate-200">
          <code>{code}</code>
        </pre>
      </div>
    </section>
  );
}

function ProblemStateBadge({ state }: { state: Problem["state"] }) {
  if (state === "COMPLETE") {
    return (
      <span className="inline-flex rounded-full bg-secondary-fixed px-3 py-1 text-body-sm font-semibold text-on-secondary-fixed">
        COMPLETE
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-body-sm font-semibold text-slate-500">
      PENDING
    </span>
  );
}
