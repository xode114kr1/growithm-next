import type { StudyProblemFilters } from "../types";

export function buildStudyProblemQueryString(filters: StudyProblemFilters) {
  const query = new URLSearchParams();

  if (filters.platform) {
    query.set("platform", filters.platform);
  }

  if (filters.tier) {
    query.set("tier", filters.tier);
  }

  if (filters.member) {
    query.set("member", filters.member);
  }

  if (filters.sort !== "latest") {
    query.set("sort", filters.sort);
  }

  return query.toString();
}
