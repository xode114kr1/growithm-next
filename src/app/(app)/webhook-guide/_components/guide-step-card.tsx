import { ExternalLink } from "lucide-react";

import type { WebhookGuideStep } from "../constants";

type GuideStepCardProps = {
  step: WebhookGuideStep;
};

export function GuideStepCard({ step }: GuideStepCardProps) {
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
      <div className="mt-auto pt-6">
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
    </article>
  );
}
