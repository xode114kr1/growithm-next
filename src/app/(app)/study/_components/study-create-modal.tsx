"use client";

import { useEffect, useId, useState } from "react";

const tierOptions = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ruby"];

export default function StudyCreateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="rounded-lg bg-primary px-4 py-2 text-body-sm font-semibold text-on-primary transition-all hover:opacity-90"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        스터디 생성
      </button>

      {isOpen ? (
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/25 px-4 py-8 backdrop-blur-sm"
          role="dialog"
        >
          <button
            aria-label="스터디 생성 모달 닫기"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <section className="relative max-h-[calc(100svh-4rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-2xl shadow-slate-950/20">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-label-caps text-slate-400">New Study</p>
                  <h2 className="text-h3-ui text-primary" id={titleId}>
                    스터디 생성
                  </h2>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    함께 풀이할 목표와 운영 방식을 설정하세요.
                  </p>
                </div>
                <button
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-xl font-semibold text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
            </div>

            <form className="space-y-6 px-6 py-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-label-caps text-slate-500">
                    Study Name
                  </span>
                  <input
                    className="input-field"
                    placeholder="예: Algorithm Sprint"
                    type="text"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-label-caps text-slate-500">
                    Target Tier
                  </span>
                  <select className="input-field">
                    {tierOptions.map((tier) => (
                      <option key={tier}>{tier}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-label-caps text-slate-500">
                    Max Members
                  </span>
                  <input
                    className="input-field"
                    min={2}
                    type="number"
                    defaultValue={8}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-label-caps text-slate-500">
                    Description
                  </span>
                  <textarea
                    className="min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-all placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-secondary-container/30"
                    placeholder="스터디 목표, 진행 방식, 권장 풀이 주기를 적어주세요."
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-5 sm:flex-row">
                <button
                  className="btn-secondary"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  취소
                </button>
                <button className="btn-primary" type="button">
                  스터디 생성
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
