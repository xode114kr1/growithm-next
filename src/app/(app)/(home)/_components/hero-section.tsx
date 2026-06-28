import {
  Button,
  ButtonAnchor,
  ButtonLink,
} from "@/components/ui/button";
import { signInWithGitHub } from "../actions";

export default function HeroSection({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-surface px-4 pb-20 pt-32 sm:px-10">
      <div className="mx-auto flex max-w-container flex-col items-center gap-16 lg:flex-row">
        <div className="z-10 flex-1 space-y-8">
          <h1 className="max-w-2xl text-h1-editorial text-primary">
            알고리즘으로 함께 성장하세요
          </h1>
          <p className="max-w-xl text-body-lg text-on-surface-variant">
            개발자 취업의 필수 관문인 코딩 테스트, 이제 Growithm과 함께
            체계적으로 준비하세요. 깃허브 자동 연동부터 스터디 그룹까지 완벽한
            환경을 제공합니다.
          </p>
          <div className="flex flex-wrap gap-4">
            <StartButton isAuthenticated={isAuthenticated} />
            <ButtonAnchor href="#features" size="lg" variant="secondary">
              <span aria-hidden="true">▶</span>
              기능 살펴보기
            </ButtonAnchor>
          </div>
        </div>
        <CodePreview />
      </div>
    </section>
  );
}

function StartButton({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (isAuthenticated) {
    return (
      <ButtonLink href="/dashboard" size="lg" variant="primary">
        시작하기
      </ButtonLink>
    );
  }

  return (
    <form action={signInWithGitHub}>
      <Button size="lg" type="submit" variant="primary">
        시작하기
      </Button>
    </form>
  );
}

function CodePreview() {
  return (
    <div className="relative flex-1">
      <div className="absolute inset-0 aspect-square scale-95 rounded-xl bg-linear-to-br from-primary-fixed to-surface-container-highest opacity-50 -rotate-6" />
      <div className="surface-card relative rounded-xl border-slate-100 p-8">
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
