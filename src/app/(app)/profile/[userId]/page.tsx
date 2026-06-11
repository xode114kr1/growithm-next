import Image from "next/image";
import { notFound } from "next/navigation";

import { getUserProfilePageData } from "@/services/users/user.server";

type ProfilePageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const profile = await getUserProfilePageData(userId);

  if (!profile) {
    notFound();
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <section className="app-card flex flex-col gap-8 p-8 md:flex-row md:items-center">
          <Image
            alt={`${profile.name} avatar`}
            className="size-28 rounded-full object-cover ring-4 ring-slate-50"
            height={112}
            src={profile.avatar}
            width={112}
          />
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center">
              <h1 className="page-title">{profile.name}</h1>
              <span
                className={`w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${profile.tierClass}`}
              >
                {profile.tier}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileStat
                label="XP"
                value={profile.score.toLocaleString()}
              />
              <ProfileStat
                label="Solved"
                value={profile.solvedCount.toLocaleString()}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="text-label-caps text-slate-400">{label}</div>
      <div className="text-body-lg font-semibold text-on-background">
        {value}
      </div>
    </div>
  );
}
