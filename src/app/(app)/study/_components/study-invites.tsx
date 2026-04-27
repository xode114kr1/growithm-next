import Image from "next/image";

const activities = [
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAPt1TWg6k8TvvhzTif9sfOEfjm9_ZP0xlljD1pu580BSFCSFGKIOmlxSL_GFBMr9a7czkgo4_GKqbBh-OtRpevEJGU1tlgH82dwUBl314g2QPZMVcw5Ro72uDHddpnp2ndAKsOhjQTlBJZCpwyQcY00ONHQnEnq1fzKrFCGM6kQD7fscfDhwS3ARWwQVCKARH_v4oH1ce4FBilShkFerGP6zYcYafR2FSjf-m8JECR9bD3zhT044EJWNiddyuQZlUor2I2m1t4wMU",
    name: "David Kim",
    primaryAction: "Accept",
    secondaryAction: "Decline",
    study: "System Design Lab",
    time: "2 hours ago",
    type: "invited you to",
  },
  {
    initials: "SM",
    name: "Sarah Miller",
    primaryAction: "Review",
    secondaryAction: "Dismiss",
    study: "FAANG Interview Prep",
    time: "Yesterday",
    type: "requested to join",
  },
];

export default function StudyInvites() {
  return (
    <section className="flex h-[min(520px,calc(100vh-9rem))] flex-col overflow-hidden rounded-xl border border-slate-100 bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-50 p-6">
        <h2 className="font-bold text-primary">Invites & Requests</h2>
        <span className="rounded-full bg-error px-1.5 py-0.5 text-[10px] font-bold text-white">
          2
        </span>
      </div>
      <div className="flex-1 divide-y divide-slate-50 overflow-y-auto">
        {activities.map((activity) => (
          <article className="p-4 transition-all hover:bg-slate-50" key={activity.name}>
            <div className="mb-3 flex gap-3">
              {activity.avatar ? (
                <Image
                  alt={`${activity.name} avatar`}
                  className="size-10 rounded-full object-cover"
                  height={40}
                  src={activity.avatar}
                  width={40}
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-primary-fixed font-bold text-primary">
                  {activity.initials}
                </div>
              )}
              <div className="flex-1">
                <p className="text-body-sm">
                  <span className="font-bold text-on-surface">
                    {activity.name}
                  </span>{" "}
                  {activity.type}{" "}
                  <span className="font-semibold text-primary">
                    {activity.study}
                  </span>
                </p>
                <span className="text-[10px] uppercase tracking-wider text-outline">
                  {activity.time}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 rounded-md bg-primary py-1.5 text-xs font-bold text-on-primary transition-all hover:opacity-90"
                type="button"
              >
                {activity.primaryAction}
              </button>
              <button
                className="flex-1 rounded-md bg-surface-container py-1.5 text-xs font-bold text-on-surface-variant transition-all hover:bg-outline-variant/20"
                type="button"
              >
                {activity.secondaryAction}
              </button>
            </div>
          </article>
        ))}
      </div>
      <button
        className="w-full shrink-0 bg-slate-50/50 py-3 text-xs font-bold text-outline transition-all hover:text-primary"
        type="button"
      >
        View All Activity
      </button>
    </section>
  );
}
