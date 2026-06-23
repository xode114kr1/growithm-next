import StudyCreateModal from "./study-create-modal";

export default function StudyListHeader() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="section-title text-on-surface">참여 중인 스터디</h2>
      <StudyCreateModal />
    </div>
  );
}
