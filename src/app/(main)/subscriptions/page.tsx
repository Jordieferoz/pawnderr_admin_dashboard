"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { fetchSubscriptions } from "@utils/api";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Subscription, SubscriptionPagination } from "../../../../types/subscriptions";
import { subscriptionColumns } from "./columns";

type FilterState = {
  status: "active" | "expired" | "cancelled" | undefined;
};

const FILTER_LABELS: Record<"active" | "expired" | "cancelled", string> = {
  active: "Active",
  expired: "Expired",
  cancelled: "Cancelled",
};

export default function SubscriptionPage() {
  const router = useRouter();
  const [data, setData] = useState<Subscription[]>([]);
  const [pagination, setPagination] = useState<SubscriptionPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: undefined,
  });

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSubscriptions({
        page,
        limit: pageSize,
        ...(filters.status !== undefined
          ? { status: filters.status }
          : {}),
        sort: "created_at",
        order: "DESC",
      });
      const inner = res?.data?.data?.data;
      const paginationData = res?.data?.data?.pagination;
      setData(inner ?? []);
      setPagination(paginationData ?? null);
    } catch {
      setError("Failed to load subscriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Build a TanStack table instance (manual pagination)
  const table = useReactTable({
    data,
    columns: subscriptionColumns,
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

  function setStatusFilter(status: "active" | "expired" | "cancelled") {
    setFilters((prev) => {
      if (prev.status === status) return { status: undefined };
      return { status };
    });
    setPage(1);
  }

  function clearFilters() {
    setFilters({ status: undefined });
    setPage(1);
  }

  const hasFilters = filters.status !== undefined;
  const activeFilterCount = filters.status !== undefined ? 1 : 0;

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
          {pagination && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {pagination.total} total subscriptions
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
            variant={filters.status === "active" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setStatusFilter("active")}
          >
            {FILTER_LABELS.active}
          </Button>
          <Button
            variant={filters.status === "expired" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setStatusFilter("expired")}
          >
            {FILTER_LABELS.expired}
          </Button>
          <Button
            variant={filters.status === "cancelled" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setStatusFilter("cancelled")}
          >
            {FILTER_LABELS.cancelled}
          </Button>

          <div className="h-5 w-px bg-border" />

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
            <span className="text-sm">Loading subscriptions…</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-destructive">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={loadSubscriptions}
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
                columns={subscriptionColumns}
                onRowClick={(row) => router.push(`/users/${row.original.users.id}`)}
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
