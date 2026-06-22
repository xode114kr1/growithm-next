export type InfiniteScrollRequest<TFilters, TSort> = {
  filters: TFilters;
  page: number;
  sort: TSort;
};

export type InfiniteScrollResponse<TItem> = {
  currentPage: number;
  hasNextPage: boolean;
  items: TItem[];
  totalCount: number;
};
