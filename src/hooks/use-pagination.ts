"use client";

import { useState } from "react";

export function usePagination({
  itemCount,
  pageSize,
}: {
  itemCount: number;
  pageSize: number;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(itemCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    currentPage,
    endIndex: startIndex + pageSize,
    setCurrentPage: setPage,
    startIndex,
    totalPages,
  };
}
