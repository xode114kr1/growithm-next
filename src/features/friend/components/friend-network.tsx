"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";

import type {
  FriendListFilter,
  FriendProfile,
  FriendRequest,
} from "@/features/friend/types";

const tabs: { label: string; value: FriendListFilter }[] = [
  { label: "My Friends", value: "friends" },
  { label: "Received Requests", value: "received" },
  { label: "Sent Requests", value: "sent" },
];

const friends: FriendProfile[] = [
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgb3oGiEiz4g96_3kqwsY-QNFoIedmXX0BPnmN0AXv8Yh38rQ9A8_dTxM32DD1vN5QWmRZflrDQyvRL7xg4n3yLcwXxdGqjp4zhaDLrLu9aA3_T-t-AomlgybPdVCObfwtLvTuE-4OHax-dUNRg7lWPRQV4bg44LrqOfg9Be5UpjRX33QNvzCfSE2g34GSYl3C3rqX-6-QpxdmQtR7RmkwxYtcwgUk2OJDMxQa6bFunXMTOga8q0FOYo577bqrTuAnyl80bW0gFYI",
    name: "Alex Rivera",
    relationStatus: "friend",
    tier: "Platinum Tier",
    tierClass:
      "bg-gradient-to-r from-slate-100 to-white border-slate-200 text-slate-600",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBjrur5qSV0JDOIqu908Sk5Ic8mby8uNS5oX5BufFOIbk7_Gd2ePbr7hkj1ky4WeguvK8Z3Z2nBaqM9R25BUvHHU7QupiulX9EBV20iKvb_BwQ6WllSj3hjNWmj0tHLTWIy1oxMQA0wZjNb_00Jn2w24P64MhNOslSdKzGQV2sqtIc-oYggCFgOfug8PnlOyBah1zjmJ_gBtnJl5YkWyaoEzzGhRdJyaoeDQaBrqOJ9wwdjvKnNNsOLDeiWLu8j1MhVxWtaoT1aWSg",
    name: "Min-Hee Kim",
    relationStatus: "friend",
    tier: "Gold Tier",
    tierClass:
      "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200 text-amber-700",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCj_OCCULllL_qo_MoefZ2hFe9NkkjP4vG9Cf9rmRa2wpvqRKc7SDSFhwRXe-VqPXovteOhSwM28I0_4VDd-Htl-o27BNszW1PxFUN88aQY02kXEcNEZxYZ2WfL4kMk5eTuHX_8cArjjDPEI2VJhBrxDIL490YwCKdlG21bYTcqU_nTpCoQN6dS3EHTDICnICm3BH5g7l1Tr89hgKvezOrYlKS80POD6cXIMX72Iz-BQw6iEjrN4rvpTp2ox6svM2Nm0duW3vMsZgY",
    name: "Jordan Smith",
    offline: true,
    relationStatus: "friend",
    tier: "Silver Tier",
    tierClass: "bg-slate-200 border-slate-300 text-slate-600",
  },
];

const receivedRequests: FriendRequest[] = [
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvRAmcbi1H1VojcYoL4I64HV6vA0X5p2YobQhpT9eR7WyIGWKvW_xRHeNndH2v3DjjiOoRjkg2L2ul12odKjkxIsnwdjxIJh4I6DOkJyJ2kz5w6TvLJFLU7uStpiwassIUXveGvbEdGiUfKGRQThJGZQGVIpGTVK54aDihc7MDib6ETjvr7vYqdqxirkr6USFRfPG-jGmbg8HK_FMJyYLT3pjISl2gvCOCLZVPTbPLIwVO78r6CcNtuXrRG46y6PLzK8HQg8QqNyM",
    name: "Lara Croft",
    relationStatus: "received_request",
    tier: "Gold Tier",
    tierClass:
      "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200 text-amber-700",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBhIqvObXTRIHtg7mu95710ayfdbY_LQVsj9zxlhAWjz33v4P_6GAlth1yhM27DI_reYNgk6kyihrKIWXEAiTHZmdUGIuxp-nT9NaeBwBOOzXGbgKo39QrhoKIsKVfBM3syGocl0vCPACuTPEojhP__ccyYNvBvFG3I3Hq37-TCiihvEskiTa5CnPix6KG-Iyt8mG1PUYGaOXd1qSYmukdjZCpMdqtDefDk7xpekt35KtUhiqzEhegSpjZNMGtJnTcQ6Tlpai1d_wE",
    name: "Chen Wei",
    relationStatus: "received_request",
    tier: "Platinum Tier",
    tierClass:
      "bg-gradient-to-r from-slate-100 to-white border-slate-200 text-slate-600",
  },
];

const sentRequests: FriendRequest[] = [
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDj6HEJJjO0GxSUdzmrRTGFcTsya_nRSf8DgY3CVBY6qhxwFF2IHltGhc1LmHICaQxyB0iTJbYR4-tMJ7KlquFP4zNUu0Xm1dRNyJeCnmJXoPY7mWOaAH_E26p9Gb7oZPw8pUrbTdrm73bol9NgQM1iG7cuMbvbaWUZ0PzBu5Q0any15G2xZiT0J0MiLh3L9iXhFTWHXr-AIjW0_zXNw9zsee84vbRC0trDleWc72NF2WnrnU7WwRRuMdOn5bzwznya4Zsdn3BQVjw",
    name: "Elena Rossi",
    relationStatus: "sent_request",
    tier: "Diamond Tier",
    tierClass: "bg-cyan-50 border-cyan-200 text-cyan-800",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvigkJc2g3taec1La9zPT-xK5PrDruuyPWGHvg7Ns2cPPjTomCjNpQF70iPCRaX9bfADqCfeD2Hh4kmD3-rr9rXuPkOlFhcVyZK2A2vw48WYvJXDz5WTtW8XhhZ3SvqXNyWEKJ3PhIIAXOJMptPJaug_YdjHPb-og0UiZ7sWjO-xQC8MfKz-TFmcchHzB3FKeZcC0cfxXrQgWkwZeCg2v_yEy-1aimyDAM7YuSd_epHmO4cYoUePhMXJLB_hc7fUpH_fJfCGWvfSk",
    name: "Noah Park",
    relationStatus: "sent_request",
    tier: "Silver Tier",
    tierClass: "bg-slate-200 border-slate-300 text-slate-600",
  },
];

export default function FriendNetwork() {
  const [activeTab, setActiveTab] = useState<FriendListFilter>("friends");

  return (
    <>
      <section className="mb-8 flex flex-col items-stretch justify-between gap-6 md:flex-row md:items-center">
        <div className="grid rounded-xl bg-slate-100 p-1 sm:grid-cols-3 md:flex md:w-auto">
          {tabs.map((tab) => (
            <button
              className={
                activeTab === tab.value
                  ? "rounded-lg bg-white px-6 py-2 text-body-sm font-semibold text-teal-900 shadow-sm"
                  : "rounded-lg px-6 py-2 text-body-sm font-medium text-slate-500 transition-colors hover:text-teal-800"
              }
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="relative w-full md:w-96">
          <span
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            Search
          </span>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-20 pr-4 text-body-md shadow-sm outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
            placeholder="Find developers..."
            type="text"
          />
        </label>
      </section>

      {activeTab === "friends" && <FriendList />}
      {activeTab === "received" && <ReceivedRequestList />}
      {activeTab === "sent" && <SentRequestList />}
    </>
  );
}

function FriendList() {
  return (
    <section className="grid grid-cols-1 gap-4">
      {friends.map((friend) => (
        <ProfileCard key={friend.name} profile={friend}>
          <div className="flex items-center gap-3">
            <button
              aria-label={`Message ${friend.name}`}
              className="rounded-xl border border-slate-200 px-4 py-3 text-body-sm font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-teal-900"
              type="button"
            >
              Message
            </button>
            <button
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
              type="button"
            >
              Invite to Session
            </button>
          </div>
        </ProfileCard>
      ))}
      <Pagination summary="Showing 1-12 of 48 active connections" />
    </section>
  );
}

function ReceivedRequestList() {
  return (
    <section className="grid grid-cols-1 gap-4">
      {receivedRequests.map((request) => (
        <ProfileCard key={request.name} profile={request}>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <button
              className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50"
              type="button"
            >
              Decline
            </button>
            <button
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
              type="button"
            >
              Accept
            </button>
          </div>
        </ProfileCard>
      ))}
    </section>
  );
}

function SentRequestList() {
  return (
    <section className="grid grid-cols-1 gap-4">
      {sentRequests.map((request) => (
        <ProfileCard key={request.name} profile={request}>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <button
              className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-error"
              type="button"
            >
              Cancel Request
            </button>
          </div>
        </ProfileCard>
      ))}
    </section>
  );
}

function ProfileCard({
  children,
  profile,
}: {
  children: ReactNode;
  profile: FriendProfile;
}) {
  return (
    <article
      className={`app-card flex flex-col items-center gap-6 p-6 transition-all hover:border-slate-200 md:flex-row ${
        profile.offline ? "opacity-80 hover:opacity-100" : ""
      }`}
    >
      <div className="relative shrink-0">
        <Image
          alt={`${profile.name} avatar`}
          className={`size-16 rounded-full object-cover ring-4 ring-slate-50 ${
            profile.offline ? "grayscale" : ""
          }`}
          height={64}
          src={profile.avatar}
          width={64}
        />
        <span
          className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white ${
            profile.offline ? "bg-slate-300" : "bg-green-500"
          }`}
        />
      </div>
      <div className="min-w-0 flex-1 text-center md:text-left">
        <div className="mb-1 flex flex-col gap-2 md:flex-row md:items-center">
          <h2 className="section-title text-on-background">{profile.name}</h2>
          <span
            className={`mx-auto w-fit rounded-full border px-3 py-0.5 text-2.5 font-bold uppercase tracking-widest md:mx-0 ${profile.tierClass}`}
          >
            {profile.tier}
          </span>
        </div>
      </div>
      {children}
    </article>
  );
}

function Pagination({ summary }: { summary: string }) {
  return (
    <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center">
      <div className="text-body-sm text-slate-400">{summary}</div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-400 transition-all hover:text-teal-900"
          type="button"
        >
          Prev
        </button>
        <button
          className="size-10 rounded-lg bg-primary text-body-sm font-semibold text-on-primary"
          type="button"
        >
          1
        </button>
        <button
          className="size-10 rounded-lg text-body-sm font-semibold text-slate-500 hover:bg-slate-50"
          type="button"
        >
          2
        </button>
        <button
          className="size-10 rounded-lg text-body-sm font-semibold text-slate-500 hover:bg-slate-50"
          type="button"
        >
          3
        </button>
        <button
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-400 transition-all hover:text-teal-900"
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
