import {
  Skeleton,
  SkeletonCard,
  SkeletonScreen,
  SkeletonStatRow,
  SkeletonText,
} from "@/components/common/skeleton";

/**
 * W-07 방 리포트 — 스켈레톤 (design.pen "07 · 로딩 · 스켈레톤" 프레임 n8LEHE).
 * 시안 구성: KPI 4칸 · 좌 문항 목록 · 우 AI 패널.
 * 시안이 이 화면에 전체 스켈레톤을 붙인 이유는 "집계가 오래 걸려 빈 화면이 길게 남습니다"이다.
 */
export function ReviewSkeleton() {
  return (
    <SkeletonScreen label="리포트를 불러오는 중">
      <div className="flex min-h-screen flex-col gap-4 px-8 py-[26px]">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-64" />
          <Skeleton soft className="h-9 w-28 rounded-xl" />
        </div>

        <SkeletonStatRow count={4} />

        <div className="flex flex-1 gap-4">
          <div className="flex min-w-0 flex-[3] flex-col gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl bg-card px-5 py-4">
                <Skeleton soft className="size-8 shrink-0 rounded-full" />
                <Skeleton className="h-4 min-w-0 flex-1" />
                <Skeleton soft className="h-3 w-20 shrink-0" />
              </div>
            ))}
          </div>

          <SkeletonCard className="flex-[2] gap-4">
            <Skeleton className="h-4 w-32" />
            <SkeletonText lines={4} soft />
            <SkeletonText lines={3} soft />
            <Skeleton className="mt-auto h-10 w-full rounded-xl" />
          </SkeletonCard>
        </div>
      </div>
    </SkeletonScreen>
  );
}
