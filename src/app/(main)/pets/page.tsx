"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { fetchUsers } from "@utils/api";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { User, UserPagination } from "../../../../types/users";
import { userColumns } from "./columns";

type FilterState = {
  is_active: boolean | undefined;
  is_premium: boolean | undefined;
};

const FILTER_LABELS: Record<
  "active" | "inactive" | "premium" | "free",
  string
> = {
  active: "Active",
  inactive: "Inactive",
  premium: "Premium",
  free: "Free",
};

export default function PetsPage() {
  const router = useRouter();
  const [data, setData] = useState<User[]>([]);
  const [pagination, setPagination] = useState<UserPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    is_active: undefined,
    is_premium: undefined,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUsers({
        page,
        limit: pageSize,
        ...(filters.is_active !== undefined
          ? { is_active: filters.is_active }
          : {}),
        ...(filters.is_premium !== undefined
          ? { is_premium: filters.is_premium }
          : {}),
      });
      const inner = res?.data?.data?.data;
      const paginationData = res?.data?.data?.pagination;
      setData(inner ?? []);
      setPagination(paginationData ?? null);
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Build a TanStack table instance (manual pagination)
  const table = useReactTable({
    data,
    columns: userColumns,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
    rowCount: pagination?.total ?? 0,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize })
          : updater;
      setPage(next.pageIndex + 1);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  // Helper: toggle a boolean filter (undefined → true → false → undefined)
  function toggleFilter(key: keyof FilterState, value: boolean) {
    setFilters((prev) => {
      const current = prev[key];
      const next = current === value ? undefined : value;
      return { ...prev, [key]: next };
    });
    setPage(1);
  }

  function clearFilters() {
    setFilters({ is_active: undefined, is_premium: undefined });
    setPage(1);
  }

  const hasFilters =
    filters.is_active !== undefined || filters.is_premium !== undefined;

  const activeFilterCount = [filters.is_active, filters.is_premium].filter(
    (v) => v !== undefined,
  ).length;

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          {pagination && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {pagination.total} total users
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground pr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </span>

          {/* Status filters */}
          <Button
            variant={filters.is_active === true ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleFilter("is_active", true)}
          >
            {FILTER_LABELS.active}
          </Button>
          <Button
            variant={filters.is_active === false ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleFilter("is_active", false)}
          >
            {FILTER_LABELS.inactive}
          </Button>

          <div className="h-5 w-px bg-border" />

          {/* Premium filters */}
          <Button
            variant={filters.is_premium === true ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleFilter("is_premium", true)}
          >
            {FILTER_LABELS.premium}
          </Button>
          <Button
            variant={filters.is_premium === false ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleFilter("is_premium", false)}
          >
            {FILTER_LABELS.free}
          </Button>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Loading overlay */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading users…</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-destructive">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={loadUsers}
              className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <DataTable
                table={table}
                columns={userColumns}
                onRowClick={(row) => router.push(`/users/${row.original.id}`)}
              />
            </div>
            <div className="border-t py-3">
              <DataTablePagination table={table} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
