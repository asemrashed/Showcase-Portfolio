"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api, qk, STALE } from "@/lib/api/client";
import { useFilterUrlSync } from "@/hooks/use-filter-url-sync";
import { SearchBar } from "./search-bar";
import { CategoryChips } from "./category-chips";
import { ProjectGrid } from "./project-grid";
import { ProjectGridSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import type { ProjectsPage } from "@/types/api";

const PAGE_SIZE = 12;

export function ProjectsExplorer({ initialData }: { initialData?: ProjectsPage }) {
  const { category, search } = useFilterUrlSync();
  const filters = { category: category || undefined, search: search || undefined };

  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } =
    useInfiniteQuery({
      queryKey: qk.projects(filters),
      queryFn: ({ pageParam }) => api.projects({ ...filters, page: pageParam, pageSize: PAGE_SIZE }),
      initialPageParam: 1,
      getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
      staleTime: STALE.projects,
      // Only the unfiltered first page can safely seed the cache (SSR always loads page 1, no filters).
      initialData: !category && !search && initialData ? { pages: [initialData], pageParams: [1] } : undefined,
    });

  const projects = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar className="w-full sm:max-w-xs" />
        <CategoryChips />
      </div>

      <div className="mt-8">
        {isPending ? (
          <ProjectGridSkeleton count={PAGE_SIZE} />
        ) : isError ? (
          <ErrorState
            title="Couldn't load projects"
            description={error instanceof Error ? error.message : "Something went wrong. Please try again."}
            action={{ label: "Try again", onClick: () => refetch() }}
          />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description={search || category ? "Try a different search or category." : "Projects will show up here once they're published."}
          />
        ) : (
          <>
            {typeof total === "number" && (
              <p className="mb-6 text-sm text-muted-foreground">
                {total} {total === 1 ? "project" : "projects"}
              </p>
            )}
            <ProjectGrid projects={projects} />
            {hasNextPage && (
              <div className="mt-12 flex justify-center">
                <Button variant="secondary" size="lg" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      {isRefetching && !isFetchingNextPage && (
        <span className="sr-only" role="status">
          Refreshing projects
        </span>
      )}
    </div>
  );
}
