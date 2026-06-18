export type {
  StudyProblemFilters,
  StudyProblemSort,
} from "@/types/study";

export type StudyProblemPageSearchParams = {
  member?: string | string[];
  page?: string | string[];
  platform?: string | string[];
  sort?: string | string[];
  tier?: string | string[];
};
