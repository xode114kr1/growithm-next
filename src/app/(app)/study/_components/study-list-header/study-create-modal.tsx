"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";

import { createStudy, type CreateStudyActionState } from "../../actions";

const initialState: CreateStudyActionState = {
  description: "",
  error: null,
  status: "idle",
  studyId: null,
  title: "",
};

export default function StudyCreateModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  async function handleCreateStudy(formData: FormData) {
    const result = await createStudy(initialState, formData);

    if (result.studyId) {
      router.push(`/study/${result.studyId}/overview`);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="primary"
      >
        스터디 생성
      </Button>
      {isOpen ? (
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-80 flex items-center justify-center bg-primary/25 px-4 py-8 backdrop-blur-sm"
          role="dialog"
        >
          <section className="relative max-h-[calc(100svh-4rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-2xl shadow-slate-950/20">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-label-caps text-slate-400">새 스터디</p>
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

            <form action={handleCreateStudy} className="space-y-6 px-6 py-6">
              <div className="grid grid-cols-1 gap-5">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-label-caps text-slate-500">
                    Title
                  </span>
                  <input
                    className="input-field"
                    maxLength={80}
                    name="title"
                    placeholder="예: Algorithm Sprint"
                    required
                    type="text"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-label-caps text-slate-500">
                    Description
                  </span>
                  <textarea
                    className="min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-all placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-secondary-container/30"
                    maxLength={500}
                    name="description"
                    placeholder="스터디 목표, 진행 방식, 권장 풀이 주기를 적어주세요."
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-5 sm:flex-row">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="secondary"
                >
                  취소
                </Button>
                <Button type="submit" variant="primary">
                  스터디 생성
                </Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
