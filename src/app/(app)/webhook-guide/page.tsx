import { GuideStepCard } from "./_components/guide-step-card";
import { RepoRegistrationCard } from "./_components/repo-registration-card";
import { webhookGuideSteps } from "./constants";

export default function WebhookGuidePage() {
  return (
    <main className="page-shell">
      <div className="page-container space-y-8">
        <section className="grid grid-cols-1 gap-gutter xl:grid-cols-2">
          {webhookGuideSteps.map((step) => (
            <GuideStepCard key={step.badge} step={step} />
          ))}
        </section>

        <RepoRegistrationCard />
      </div>
    </main>
  );
}
