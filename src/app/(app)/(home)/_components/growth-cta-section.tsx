import { signIn } from "@/lib/auth/auth";

const trustBadges = ["GITHUB VERIFIED", "SECURE SYNC", "REAL-TIME REVIEW"];

export default function GrowthCtaSection() {
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
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button
                className="inline-flex min-h-16 items-center justify-center rounded-2xl bg-secondary-fixed px-10 text-body-lg font-bold text-on-secondary-container shadow-xl transition-transform hover:scale-[1.03]"
                type="submit"
              >
                오늘의 문제 풀기
              </button>
            </form>
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
