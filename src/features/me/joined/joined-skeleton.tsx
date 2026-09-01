import {
  Skeleton,
  SkeletonCard,
  SkeletonRows,
  SkeletonScreen,
  SkeletonStatRow,
} from "@/components/common/skeleton";

/**
 * W-13 참여한 방 — 스켈레톤.
 * 시안에 전용 프레임은 없지만 "화면별 로딩 방식" 표가 W-13을 전체 스켈레톤으로 지정한다.
 * JoinedPage 구성(진행 중 배너 · KPI 3칸 · 보완할 주제 칩 · 세션 목록)을 그대로 따라간다.
 */
export function JoinedSkeleton() {
  return (
    <SkeletonScreen label="참여 기록을 불러오는 중">
      <div className="flex flex-col gap-5 px-9 py-7">
        <SkeletonCard className="gap-3 bg-mint-bg">
          <Skeleton className="h-5 w-44" />
          <Skeleton soft className="w-[46%]" />
        </SkeletonCard>

        <SkeletonStatRow count={3} />

        <SkeletonCard className="gap-3">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} soft className="h-7 w-24 rounded-full" />
            ))}
          </div>
        </SkeletonCard>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <SkeletonRows count={3} />
        </div>
      </div>
    </SkeletonScreen>
  );
}
