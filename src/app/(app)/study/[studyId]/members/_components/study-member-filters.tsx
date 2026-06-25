"use client";

import {
  FilterCard,
  FilterSelect,
} from "@/components/ui/filter-card";
import { useReplaceQueryParams } from "@/hooks/use-query-params";

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
      <FilterCard title="Search Members">
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
      <FilterCard title="Role">
        <FilterSelect
          aria-label="멤버 역할"
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
        </FilterSelect>
      </FilterCard>
      <FilterCard title="Sort">
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
