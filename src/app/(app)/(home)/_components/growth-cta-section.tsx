import { Button, ButtonLink } from "@/components/ui/button";
import { signInWithGitHub } from "../actions";

export default function GrowthCtaSection({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <section className="relative bg-surface px-4 py-24 sm:px-10">
      <div className="relative mx-auto max-w-container overflow-hidden rounded-xl bg-primary-container p-8 text-center sm:p-16">
        <div className="absolute inset-0 opacity-10">
          <div className="size-full bg-[linear-gradient(135deg,transparent_0_24px,var(--primary-fixed)_24px_25px,transparent_25px_48px)] bg-size-[48px_48px]" />
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
            <StartButton isAuthenticated={isAuthenticated} />
          </div>
        </div>
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
