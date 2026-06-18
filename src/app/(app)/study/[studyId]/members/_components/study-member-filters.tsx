"use client";

import { useReplacePaginatedQueryParams } from "@/hooks/use-replace-paginated-query-params";

import type {
  StudyMemberFiltersState,
  StudyMemberRoleFilter,
  StudyMemberSort,
} from "../types";

export default function StudyMemberFilters({
  filters,
}: {
  filters: StudyMemberFiltersState;
}) {
  const replaceQuery = useReplacePaginatedQueryParams();

  return (
    <div className="app-card grid grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_180px_180px]">
      <label className="block min-w-0">
        <span className="mb-2 block text-label-caps text-slate-500">
          Search Members
        </span>
        <input
          className="input-field"
          defaultValue={filters.q}
          onChange={(event) =>
            replaceQuery({ q: event.target.value.trim() || null })
          }
          placeholder="이름 검색"
          type="search"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-label-caps text-slate-500">Role</span>
        <select
          className="input-field"
          onChange={(event) => {
            const role = event.target.value as StudyMemberRoleFilter;
            replaceQuery({ role: role === "ALL" ? null : role });
          }}
          value={filters.role}
        >
          <option value="ALL">전체</option>
          <option value="OWNER">owner</option>
          <option value="LEADER">리더</option>
          <option value="MEMBER">멤버</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-label-caps text-slate-500">Sort</span>
        <select
          className="input-field"
          onChange={(event) => {
            const sort = event.target.value as StudyMemberSort;
            replaceQuery({
              sort: sort === "contribution" ? null : sort,
            });
          }}
          value={filters.sort}
        >
          <option value="contribution">기여도순</option>
          <option value="lastActive">최근 활동순</option>
          <option value="joinedAt">가입일순</option>
          <option value="name">이름순</option>
        </select>
      </label>
    </div>
  );
}
