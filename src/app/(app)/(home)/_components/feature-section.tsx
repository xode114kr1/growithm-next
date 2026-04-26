import FeatureIcon from "@/app/(app)/(home)/_components/feature-icon";

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

export default function FeatureSection() {
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
