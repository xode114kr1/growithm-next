"use client";

import {
  FilterCard,
  FilterSelect,
} from "@/components/ui/filter-card";
import { useReplaceQueryParams } from "@/hooks/use-query-params";
import { studyMemberRoleLabels } from "@/utils/study-role";

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
  const replaceQuery = useReplaceQueryParams();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <FilterCard title="검색">
        <input
          aria-label="멤버 검색"
          className="input-field min-h-10"
          defaultValue={filters.q}
          onChange={(event) =>
            replaceQuery({ q: event.target.value.trim() || null })
          }
          placeholder="이름 검색"
          type="search"
        />
      </FilterCard>
      <FilterCard title="역할">
        <FilterSelect
          aria-label="멤버 역할"
          onChange={(event) => {
            const role = event.target.value as StudyMemberRoleFilter;
            replaceQuery({ role: role === "ALL" ? null : role });
          }}
          value={filters.role}
        >
          <option value="ALL">All</option>
          <option value="OWNER">{studyMemberRoleLabels.OWNER}</option>
          <option value="LEADER">{studyMemberRoleLabels.LEADER}</option>
          <option value="MEMBER">{studyMemberRoleLabels.MEMBER}</option>
        </FilterSelect>
      </FilterCard>
      <FilterCard title="정렬">
        <FilterSelect
          aria-label="멤버 정렬"
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
        </FilterSelect>
      </FilterCard>
    </div>
  );
}
