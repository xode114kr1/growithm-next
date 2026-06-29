import { LogIn } from "lucide-react";

import { signIn } from "@/lib/auth/auth";
import { Button } from "@/components/ui/button";

type AuthRequiredCardProps = {
  redirectTo?: string;
  title?: string;
};

export default function AuthRequiredCard({
  redirectTo = "/dashboard",
  title = "로그인이 필요합니다.",
}: AuthRequiredCardProps) {
  async function signInWithGitHub() {
    "use server";

    await signIn("github", { redirectTo });
  }

  return (
    <section className="app-card flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary-container text-primary">
        <LogIn aria-hidden="true" className="size-6" />
      </div>
      <h1 className="mt-5 text-xl font-bold text-primary">{title}</h1>
      <p className="mt-3 max-w-md text-body-sm leading-relaxed text-on-surface-variant">
        Growithm 서비스를 이용하려면 GitHub 로그인이 필요합니다.
      </p>
      <form action={signInWithGitHub} className="mt-6">
        <Button size="md" type="submit" variant="primary">
          <LogIn aria-hidden="true" className="size-4" />
          GitHub로 로그인
        </Button>
      </form>
    </section>
  );
}
