import { auth } from "@/lib/auth/auth";
import { getLatestGitHubRepositoryWebhook } from "@/server/webhook-registration/webhook-registration.query.service";

import { GuideStepCard } from "./_components/guide-step-card";
import { RepoRegistrationCard } from "./_components/repo-registration-card";
import { webhookGuideSteps } from "./constants";

export default async function WebhookGuidePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const currentWebhook = userId
    ? await getLatestGitHubRepositoryWebhook(userId)
    : null;

  return (
    <main className="page-shell">
      <div className="page-container space-y-8">
        <section className="grid grid-cols-1 gap-gutter xl:grid-cols-2">
          {webhookGuideSteps.map((step) => (
            <GuideStepCard key={step.badge} step={step} />
          ))}
        </section>

        <RepoRegistrationCard currentWebhook={currentWebhook} />
      </div>
    </main>
  );
}
