import type { ProblemPageSearchParams } from "@/types/problem";

export function buildQueryString(params: ProblemPageSearchParams) {
  const query = new URLSearchParams();

  for (const key of ["platform", "tier", "q", "sort"] as const) {
    const rawValue = params[key];
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    if (value?.trim()) {
      query.set(key, value.trim());
    }
  }

  return query.toString();
}
