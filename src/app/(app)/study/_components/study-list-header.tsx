"use client";

import { useState } from "react";
import StudyCreateModal from "./study-create-modal";

export default function StudyListHeader() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="section-title text-on-surface">참여 중인 스터디</h2>
      <button
        className="rounded-lg bg-primary px-4 py-2 text-body-sm font-semibold text-on-primary transition-all hover:opacity-90"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        스터디 생성
      </button>
      <StudyCreateModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
