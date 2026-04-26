const heatmapColors = [
  "bg-slate-100",
  "bg-emerald-100",
  "bg-emerald-300",
  "bg-emerald-500",
  "bg-slate-100",
  "bg-emerald-200",
  "bg-emerald-400",
  "bg-emerald-200",
  "bg-slate-100",
  "bg-emerald-600",
  "bg-emerald-400",
  "bg-emerald-200",
  "bg-slate-100",
  "bg-emerald-100",
  "bg-emerald-500",
  "bg-emerald-300",
  "bg-slate-100",
  "bg-emerald-100",
  "bg-emerald-500",
  "bg-emerald-200",
  "bg-emerald-300",
];

const growthBars = [
  "h-[40%]",
  "h-[60%]",
  "h-[55%]",
  "h-[80%]",
  "h-full",
  "h-[70%]",
  "h-[90%]",
];

const trustBadges = ["GITHUB VERIFIED", "SECURE SYNC", "REAL-TIME REVIEW"];

export default function Home() {
  return (
    <main className="bg-surface text-on-surface">
      <HeroSection />
      <FeatureSection />
      <GrowthCtaSection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface px-4 pb-20 pt-32 sm:px-10">
      <div className="mx-auto flex max-w-container flex-col items-center gap-16 lg:flex-row">
        <div className="z-10 flex-1 space-y-8">
          <div className="inline-flex rounded-full bg-primary-fixed px-4 py-1.5 text-label-caps text-on-primary-fixed">
            Algorithm Study Reinvented
          </div>
          <h1 className="max-w-2xl text-h1-editorial text-primary">
            알고리즘으로 함께 성장하세요
          </h1>
          <p className="max-w-xl text-body-lg text-on-surface-variant">
            개발자 취업의 필수 관문인 코딩 테스트, 이제 Growithm과 함께
            체계적으로 준비하세요. 깃허브 자동 연동부터 스터디 그룹까지 완벽한
            환경을 제공합니다.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              className="btn-primary min-h-14 rounded-xl px-8 text-base"
              href="/problem"
            >
              시작하기
            </a>
            <a
              className="btn-secondary min-h-14 rounded-xl px-8 text-base"
              href="#features"
            >
              <span aria-hidden="true">▶</span>
              기능 살펴보기
            </a>
          </div>
        </div>
        <CodePreview />
      </div>
    </section>
  );
}

function CodePreview() {
  return (
    <div className="relative flex-1">
      <div className="absolute inset-0 aspect-square scale-95 rounded-[40px] bg-gradient-to-br from-primary-fixed to-surface-container-highest opacity-50 -rotate-6" />
      <div className="surface-card relative rounded-[40px] border-slate-100 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="size-3 rounded-full bg-red-400" />
            <span className="size-3 rounded-full bg-amber-400" />
            <span className="size-3 rounded-full bg-emerald-400" />
          </div>
          <div className="text-mono-code text-body-sm text-slate-400">
            algorithm_study.py
          </div>
        </div>
        <pre className="overflow-hidden whitespace-pre-wrap text-mono-code text-body-sm leading-relaxed text-primary">
          <code>{`def grow_together(community):
    progress = 0
    for member in community:
        solve_count = member.get_solves()
        if solve_count > 0:
            sync_to_github(member)
            progress += solve_count
    return progress

# Start growing with Growithm
community = Growithm.get_members()
print(grow_together(community))`}</code>
        </pre>
        <div className="mt-8 flex items-center justify-between rounded-xl border border-slate-100 bg-surface-container-lowest p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-6 items-center justify-center rounded-full bg-secondary-fixed text-xs font-bold text-secondary">
              ✓
            </span>
            <span className="text-body-sm text-on-surface">
              Successfully synced to GitHub
            </span>
          </div>
          <span className="text-mono-code text-xs text-slate-400">
            Just now
          </span>
        </div>
      </div>
    </div>
  );
}

function FeatureSection() {
  return (
    <section
      className="bg-surface-container-low px-4 py-24 sm:px-10"
      id="features"
    >
      <div className="mx-auto max-w-container">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-h2-editorial text-primary">
            지속 가능한 학습을 위한 강력한 도구
          </h2>
          <p className="text-body-md text-on-surface-variant">
            복잡한 관리는 Growithm에게 맡기고 오직 문제 풀이에만 집중하세요.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <GitHubSyncCard />
          <StudyGroupCard />
          <GrowthMetricsCard />
        </div>
      </div>
    </section>
  );
}

function GitHubSyncCard() {
  return (
    <article className="surface-card flex flex-col items-center gap-8 rounded-3xl p-10 md:col-span-8 md:flex-row">
      <div className="flex-1 space-y-4">
        <FeatureIcon label="↻" tone="primary" />
        <h3 className="text-h3-ui text-primary">GitHub 자동 연동</h3>
        <p className="text-body-md text-on-surface-variant">
          문제를 해결하는 즉시 당신의 깃허브 레포지토리에 코드가 자동으로
          푸시됩니다.
        </p>
      </div>
      <div className="flex flex-1 justify-center">
        <div className="grid grid-cols-7 gap-1 rounded-lg border border-slate-100 bg-slate-50 p-4">
          {heatmapColors.map((color, index) => (
            <span
              className={`size-4 rounded-sm ${color}`}
              key={`${color}-${index}`}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

function StudyGroupCard() {
  return (
    <article className="relative overflow-hidden rounded-3xl bg-primary p-10 text-on-primary md:col-span-4">
      <div className="relative z-10 space-y-4">
        <FeatureIcon label="👥" tone="inverse" />
        <h3 className="text-h3-ui">함께하는 스터디</h3>
        <p className="text-body-md text-white/80">
          혼자하면 힘들지만 함께하면 즐겁습니다. 실시간 코드 리뷰와 주간
          랭킹으로 경쟁하며 성장하세요.
        </p>
      </div>
      <div className="absolute bottom-4 right-6 text-8xl font-bold text-white/10">
        G
      </div>
    </article>
  );
}

function GrowthMetricsCard() {
  return (
    <article className="surface-card flex flex-col justify-between rounded-3xl p-10 md:col-span-12">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <h3 className="text-h3-ui text-primary">데이터로 확인하는 성장</h3>
          <p className="text-body-md text-on-surface-variant">
            문제 풀이 효율과 알고리즘 습득도를 시각화합니다.
          </p>
        </div>
      </div>
      <div className="flex h-32 items-end gap-2">
        {growthBars.map((height, index) => (
          <span
            className={`flex-1 rounded-t-lg ${height} ${index === 4 ? "bg-secondary-fixed" : "bg-primary-fixed"}`}
            key={`${height}-${index}`}
          />
        ))}
      </div>
    </article>
  );
}

function GrowthCtaSection() {
  return (
    <section className="relative bg-surface px-4 py-24 sm:px-10">
      <div className="relative mx-auto max-w-container overflow-hidden rounded-[48px] bg-primary-container p-8 text-center sm:p-16">
        <div className="absolute inset-0 opacity-10">
          <div className="size-full bg-[linear-gradient(135deg,transparent_0_24px,var(--primary-fixed)_24px_25px,transparent_25px_48px)] bg-[length:48px_48px]" />
        </div>
        <div className="relative z-10 space-y-8">
          <h2 className="text-h1-editorial text-on-primary">
            지금 바로 성장을 기록하세요
          </h2>
          <p className="mx-auto max-w-2xl text-body-lg text-primary-fixed">
            준비는 끝났습니다. 이제 당신의 실력을 증명할 차례입니다.
            <br />
            Growithm과 함께라면 알고리즘 정복은 더 이상 막막한 과제가 아닙니다.
          </p>
          <div className="flex justify-center">
            <a
              className="inline-flex min-h-16 items-center justify-center rounded-2xl bg-secondary-fixed px-10 text-body-lg font-bold text-on-secondary-container shadow-xl transition-transform hover:scale-[1.03]"
              href="/problem"
            >
              오늘의 문제 풀기
            </a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-8 border-t border-on-primary-container/30 pt-8 text-label-caps text-on-primary-container sm:gap-12">
            {trustBadges.map((badge) => (
              <span className="flex items-center gap-2" key={badge}>
                <span className="size-2 rounded-full bg-secondary-fixed" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureIcon({
  label,
  tone,
}: {
  label: string;
  tone: "primary" | "secondary" | "inverse";
}) {
  const toneClass = {
    primary: "bg-primary-fixed text-primary",
    secondary: "bg-secondary-fixed text-secondary",
    inverse: "bg-white/10 text-white",
  }[tone];

  return (
    <span
      className={`flex size-12 items-center justify-center rounded-xl text-lg font-bold ${toneClass}`}
    >
      {label}
    </span>
  );
}
